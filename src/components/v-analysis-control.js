import _ from 'lodash';
import {
  bus
} from '@/event-bus.js';
import mapboxgl from 'mapbox-gl';
import Chart from 'chart.js'

var SERVER_URL = 'http://vegetatie-monitor.appspot.com'

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
    name: '',
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
      canvas: {},
      chart: {},
      progressActive: false,
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
    }
  },
  watch: {},
  mounted() {
    bus.$on('map-loaded', (event) => {
      this.canvas['legger'] = document.getElementById("legger-chart")
      this.canvas['legger'].style.display = 'none';
      this.canvas['landuse'] = document.getElementById("landuse-chart")
      this.canvas['landuse'].style.display = 'none';
      
      // When hovering over the kadaster polygons, update the data in the table
      // and make an outline of the polygon underneath the mouse pointer.
      this.map.on('mousemove', (e) => {

        this.map.getCanvas().style.cursor = '';
        var features_list = this.map.queryRenderedFeatures(e.point);
        this.map.setFilter("Kadasterlijnen", ["==", "ADMINPERCE", ""]);

        var feature = _.find(features_list[0], {
          'id': 'Kadaster'
        })
        // Check if Kadaster layer is on top
        if (feature !== undefined) {
          // highlight polygon outline
          this.map.getCanvas().style.cursor = 'pointer';
          this.map.setFilter("Kadasterlijnen", ["==", "ADMINPERCE", features_list[0].properties['ADMINPERCE']]);
          if (this.selectMode === false) {
            this.polygons = []
            var kadasterLayer = _.find(this.layers, {
              'name': 'Kadaster'
            })
            // list highlighted polygons
            _.each(features_list, (hoverfeature) => {
              if (hoverfeature.layer['id'] === 'Kadaster') {
                _.each(kadasterLayer.tableproperties, (prop) => {
                  this.polygons.push({
                    value: false,
                    name: prop.name,
                    data: hoverfeature.properties[prop.key]
                  })
                })
              }
            })
          }
        }
      })

      // When clicked on a polygon, show this polygons data in the table and
      // make a pie chart. When clicked again go back to the hover mode.
      this.map.on('click', (e) => {
        if (this.chart['legger']) {
          this.chart['legger'].destroy()
        }
        this.canvas['legger'].style.display = 'none';
        if (this.chart['landuse']) {
          this.chart['landuse'].destroy()
        }
        this.canvas['landuse'].style.display = 'none';
        
        this.progressActive = true
        var features_list = this.map.queryRenderedFeatures(e.point);

        var feature = _.find(features_list[0], {
          'id': 'Kadaster'
        })
        // highlight polygon outline
        this.map.setFilter("KadasterSelect", ["==", "ADMINPERCE", features_list[0].properties['ADMINPERCE']]);
        if (feature !== undefined) {
          this.polygons = []
          this.selectMode = true
          var kadasterLayer = _.find(this.layers, {
            'name': 'Kadaster'
          })
          // list highlighted polygons
          _.each(features_list, (hoverfeature) => {
            if (hoverfeature.layer['id'] === 'Kadaster') {
              _.each(kadasterLayer.tableproperties, (prop) => {
                this.polygons.push({
                  value: false,
                  name: prop.name,
                  data: hoverfeature.properties[prop.key]
                })
              })
            }
          })
          // query polygon feature
          var json_body = {
            "dateBegin": this.selection.beginDate,
            "dateEnd": this.selection.endDate,
            "region": {
              "type": "FeatureCollection",
              "features": [{
                "type": "Feature",
                "geometry": features_list["0"].geometry,
                "properties": {
                  "id": 1
                }
              }]
            },
            "scale": 10
          }
          this.loadPieChart('legger', json_body)
          this.loadPieChart('landuse', json_body)
        }
      })
    }),
    // Event to update date selection
    bus.$on('selection-changed', (selection) => {
      if (selection.beginDate) this.selection.beginDate = selection.beginDate
      if (selection.endDate) this.selection.endDate = selection.endDate
    })
  },
  methods: {
    // load the data required for plotting a pie chart of landuse per polygon
    loadPieChart(datatype, json_body) {
      fetch(SERVER_URL + '/map/' + datatype + '/zonal-info/', {
        method: "POST",
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
        this.canvas[datatype].style.display = 'block'
        this.chart[datatype] = this.makePieChart(this.canvas[datatype], labels, pieData, pieColors, totalArea, 'Verdeling van ' + datatype + ' klassen binnen kadaster polygoon [%]')
        if (datatype === 'landuse') this.progressActive = false
      })
    },
    // Create a pie chart with received data for vegetation classes.
    makePieChart(canvas, labels, pieData, pieColors, totalArea, title) {
      return new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: "Vegetatie klassen",
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

    closeSelectMode() {
      this.selectMode = false
      this.map.setFilter("KadasterSelect", ["==", "ADMINPERCE", ""])
      document.getElementById("legger-chart").style.display = 'none'
      document.getElementById("landuse-chart").style.display = 'none'
      if (this.chart['legger']) {
        this.chart['legger'].destroy()
        this.chart['legger'] = null
      }
    }
  },
  components: {},
  computed: {}
};
