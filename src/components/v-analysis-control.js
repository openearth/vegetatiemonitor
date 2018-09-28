import _ from 'lodash';
import {
  bus
} from '@/event-bus.js';
import mapboxgl from 'mapbox-gl'
import Chart from 'chart.js'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

var SERVER_URL = 'https://vegetatie-monitor.appspot.com'

var colors = [{
    type: '1',
    name: 'Water',
    color: '#bdeeff'
  }, {
    type: '2',
    name: 'Verhard oppervlak',
    color: '#ff817e',
  }, {
    type: '3',
    name: 'Gras en Akker',
    color: '#eefad4',
  }, {
    type: '4',
    name: 'Riet en Ruigte',
    color: '#debdde',
  }, {
    type: '5',
    name: 'Bos',
    color: '#73bf73',
  }, {
    type: '6',
    name: 'Struweel',
    color: '#d97a36',
  },
  {
    type: '0',
    name: 'Geen Data',
    color: '#00000',
  }
]

export default {
  name: 'v-analysis-control',
  props: {
    map: {
      type: Object
    },
    layers: {
      type: Array,
      required: true
    },
    selection: {
      type: Object
    }
  },
  data() {
    return {
      perceelnumber: null,
      canvas: {},
      chart: {},
      workLoad: 0,
      leggerLabels: [],
      leggerData: [],
      landuseLabels: [],
      landuseData: [],
      headers: [{
          text: 'Eigenschap',
          align: 'left',
          sortable: false,
          value: 'name',
          width: '40%'
        },
        {
          text: 'Kwantiteit',
          value: 'data',
          align: 'left',
          sortable: false,
          width: '60%'
        }
      ],
      polygons: [],
      polygonSelected: false,
      pagination: {
        rowsPerPage: 4
      },
      selectMode: false,
      selectLayer: ''
    }
  },
  watch: {},
  mounted() {
    bus.$on('map-loaded', (event) => {
        this.canvas['legger'] = this.$refs['legger-canvas']
        this.canvas['legger'].style.display = 'none'
        this.canvas['landuse'] = this.$refs['landuse-canvas']
        this.canvas['landuse'].style.display = 'none'

        // When hovering over the kadaster polygons, update the data in the table
        // and make an outline of the polygon underneath the mouse pointer.
        this.map.on('mousemove', (e) => {

          this.map.getCanvas().style.cursor = '';
          this.map.setFilter('Kadasterlijnen', ['==', 'ADMINPERCE', ''])
          this.map.setFilter('Vegetatielijnen', ['==', 'OBJECTID', ''])
          if (!this.selectMode) {
            this.polygons = []
          }

          // check the topmost feature below mouse pointer
          var features_list = this.map.queryRenderedFeatures(e.point);
          if (features_list && features_list.length > 0) {

            // find the group layer
            var firstFeature = features_list[0]
            var layer = _.find(this.layers, {
              name : firstFeature.layer.id
            })

            // hovering effect, highlight the feature the mouse is over
            if (layer && layer.hoverFilter && layer.selectProperty) {
              this.map.getCanvas().style.cursor = 'pointer';

              // highlight using filter
              var filter = this.map.getFilter(layer.hoverFilter)
              filter[2] = firstFeature.properties[layer.selectProperty]
              this.map.setFilter(layer.hoverFilter, filter);

              // list feature attributes in data-table
              if (!this.selectMode) {
                this.selectLayer = layer
                _.each(features_list, (feature) => {
                  if (feature.layer.id === firstFeature.layer.id) {
                    _.each(layer.tableproperties, (prop) => {
                      this.polygons.push({
                        value: false,
                        name: prop.name,
                        data: feature.properties[prop.key]
                      })
                    })
                  }
                })
              }
            }
          }
        })

        // When clicked on a polygon, show this polygons data in the table and
        // make a pie chart. When clicked again go back to the hover mode.
        this.map.on('click', (e) => {

          // query map and take topmost feature
          var features_list = this.map.queryRenderedFeatures(e.point);
          if (features_list && features_list.length > 0) {

            // find the group layer
            var firstFeature = features_list[0]
            var layer = _.find(this.layers, {
              name : firstFeature.layer.id
            })

            // hovering effect, highlight the feature the mouse is over
            if (layer && layer.selectFilter && layer.selectProperty) {

              this.selectMode = true
              this.selectLayer = layer

              // highlight using filter
              var filter = this.map.getFilter(layer.selectFilter)
              filter[2] = firstFeature.properties[layer.selectProperty]
              this.map.setFilter(layer.selectFilter, filter);

              // list feature attributes in data-table
              this.polygons = []
              _.each(features_list, (feature) => {
                if (feature.layer.id === firstFeature.layer.id) {
                  _.each(layer.tableproperties, (prop) => {
                    this.polygons.push({
                      value: false,
                      name: prop.name,
                      data: feature.properties[prop.key]
                    })
                  })
                }
              })

              this.perceelnumber = firstFeature.properties[layer.selectProperty]

              // query polygon feature
              var json_body = {
                "dateBegin": this.selection.beginDate,
                "dateEnd": this.selection.endDate,
                "region": {
                  "type": "FeatureCollection",
                  "features": [{
                    "type": "Feature",
                    "geometry": firstFeature.geometry,
                    "properties": {
                      "id": 1
                    }
                  }]
                },
                "scale": 10
              }
              this.workLoad = 0
              this.clearPieChart('legger')
              this.clearPieChart('landuse')
              if (layer.name == "Kadaster") {
                this.loadPieChart('landuse', 'kadaster', json_body)
                this.loadPieChart('legger', 'kadaster', json_body)
              } else {
                this.loadPieChart('landuse', 'legger', json_body)
              }
            }

          }
        })
      }),

      // Event to update date selection
      bus.$on('selection-changed', (selection) => {
        if (selection.beginDate) this.selection.beginDate = selection.beginDate
        if (selection.endDate) this.selection.endDate = selection.endDate
      }),

      // clear analysis panel if selected layer is turned off
      bus.$on('select-layers', (layers) => {
        if (this.selectLayer && !this.selectLayer.active) {
          this.closeSelectMode()
        }
      })
  },
  methods: {
    // load the data required for plotting a pie chart of landuse per polygon
    loadPieChart(datatype, feature, json_body) {
      // console.log('load Pie Chart', SERVER_URL + '/map/' + datatype + '/zonal-info/', JSON.stringify(json_body))
      this.workLoad++
        fetch(SERVER_URL + '/map/' + datatype + '/zonal-info/', {
          method: 'POST',
          body: JSON.stringify(json_body),
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then((res) => {
          return res.json();
        })
        .then((chartData) => {
          var labels = []
          var pieData = []
          var pieColors = []
          var totalArea = 0

          // two loops to use the total area in the second loop.
          _.each(chartData[0].area_per_type, (d) => {
            totalArea = totalArea + d.area
          })
          _.each(chartData[0].area_per_type, (d) => {
            labels.push(_.find(colors, {
              'type': d.type
            }).name)
            pieData.push((d.area / totalArea * 100).toFixed(2))
            pieColors.push(_.find(colors, {
              'type': d.type
            }).color)
          })
          if (datatype === 'legger') {
            this.leggerLabels = labels
            this.leggerData = pieData
          }
          else if (datatype === 'landuse') {
            this.landuseLabels = labels
            this.landuseData = pieData
          }
          this.canvas[datatype].style.display = 'block'
          this.chart[datatype] = this.makePieChart(this.canvas[datatype], labels, pieData, pieColors, totalArea,
            `Verdeling van ${datatype} klassen binnen ${feature} polygoon [%]`)
          this.workLoad--
        })
        .catch(function(error) {
          console.log('Error loading zonal chart data: ' + error.message)
          this.workLoad--
        })
    },
    // Create a pie chart with received data for vegetation classes.
    makePieChart(canvas, labels, pieData, pieColors, totalArea, title) {
      return new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Vegetatie klassen',
            backgroundColor: pieColors,
            data: pieData
          }]
        },
        options: {
          title: {
            display: true,
            text: title
          }
        }
      });
    },

    clearPieChart(datatype) {
      this.canvas[datatype].style.display = 'none';
      if (this.chart[datatype]) {
        this.chart[datatype].destroy()
      }
    },

    // Remove the piecharts of the selected  figure
    closeSelectMode() {
      this.clearPieChart('legger')
      this.clearPieChart('landuse')
      this.selectMode = false
      this.map.setFilter('KadasterSelect', ['==', 'ADMINPERCE', ''])
      this.map.setFilter('VegetatieSelect', ['==', 'OBJECTID', ''])
      this.polygons = []
    },

    // Build pdf with table, two piecharts and snapshot of mapbox
    downloadSelection() {
      var doc = new jsPDF()
      var W = doc.internal.pageSize.getWidth();
      var H = doc.internal.pageSize.getHeight();
      var res = doc.autoTableHtmlToJson(document.getElementsByClassName('v-table')[0]);
      doc.autoTable(res.columns, res.data);
      var imgData = this.canvas['legger'].toDataURL()
      doc.addImage(imgData, 'JPEG', W*0.1, H*0.2, W*0.4, W*0.2)
      var imgData = this.canvas['landuse'].toDataURL()
      doc.addImage(imgData, 'JPEG', W*0.5, H*0.2, W*0.4, W*0.2)
      var table = []
      _.each(this.leggerLabels, (label, i) => {
        table.push([label, this.leggerData[i]])
      })
      doc.autoTable(['Label', 'legger klassen [%]'], table, {startY: 0.35*H, tableWidth: 0.4*W, margin: {left: 0.05*W}})
      var table = []
      _.each(this.landuseLabels, (label, i) => {
        table.push([label, this.landuseData[i]])
      })
      doc.autoTable(['Label', 'landuse klassen [%]'], table, {startY: 0.35*H, tableWidth: 0.4*W, margin: {left: W*0.55}})
      this.takeScreenshot(this.map)
        .then((data) => {
          var canvas = this.map.getCanvas()
          var mapw = canvas.width
          var maph = canvas.height

          doc.addImage(data, 'JPEG', W*0.05, 0.6*H, 0.9*W, (0.9*W/mapw) * maph)
          doc.save(this.perceelnumber + '.pdf')
        })
    },

    // Note: Normally the preserveDrawerBuffer in the mapbox options is used. However This
    // is not yet build in vue2mapbox-gl and using this function the rendering of the image
    // will not reduce the performance of the mapbox components.
    takeScreenshot(map) {
      return new Promise(function(resolve, reject) {
        map.once('render', function() {
          resolve(map.getCanvas().toDataURL());
        });
        /* trigger render */
        map.setBearing(map.getBearing());
      })
    }
  },
  components: {},
  computed: {}
};
