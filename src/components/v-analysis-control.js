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
    layers: {
      type: Array,
      required: true
    },
    map: {
      type: Object
    }
  },
  data() {
    return {
      piechart: null,
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
      items: [],
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
      var canvas = document.getElementById("doughnut-chart")
      canvas.style.display = 'none';
      // When hovering over the kadaster polygons, change the data in the table
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
          this.map.getCanvas().style.cursor = 'pointer';
          this.map.setFilter("Kadasterlijnen", ["==", "ADMINPERCE", features_list[0].properties['ADMINPERCE']]);
          if (this.selectMode === false) {
            this.items = []
            var kadasterLayer = _.find(this.layers, {
              'name': 'Kadaster'
            })

            _.each(features_list, (hoverfeature) => {
              if (hoverfeature.layer['id'] === 'Kadaster') {
                _.each(kadasterLayer.tableproperties, (prop) => {
                  this.items.push({
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
        if (this.piechart !== null) {
          this.piechart.destroy()
        }
        this.progressActive = true
        canvas.style.display = 'none';
        var features_list = this.map.queryRenderedFeatures(e.point);

        var feature = _.find(features_list[0], {
          'id': 'Kadaster'
        })

        this.map.setFilter("KadasterSelect", ["==", "ADMINPERCE", features_list[0].properties['ADMINPERCE']]);
        if (feature !== undefined) {
          this.items = []
          this.selectMode = true
          canvas.style.display = 'block';
          var kadasterLayer = _.find(this.layers, {
            'name': 'Kadaster'
          })
          _.each(features_list, (hoverfeature) => {
            if (hoverfeature.layer['id'] === 'Kadaster') {
              _.each(kadasterLayer.tableproperties, (prop) => {
                this.items.push({
                  value: false,
                  name: prop.name,
                  data: hoverfeature.properties[prop.key]
                })
              })
            }
          })
          var json_body = {
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
            "scale": 100
          }
          var datatype = 'legger'
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
              this.progressActive = false
              this.makePieChart(canvas, labels, pieData, pieColors, totalArea)
            })
        }
      })
    })
  },
  methods: {
    // Create a pie chart with received data for vegetation classes.
    makePieChart(canvas, labels, pieData, pieColors, totalArea) {
      this.piechart = new Chart(canvas, {
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
            text: 'Verdeling van vegetatieklassen binnen kadaster polygoon [%]'
          }
        }
      });
    },

    closeSelectMode() {
      this.selectMode = false
      this.map.setFilter("KadasterSelect", ["==", "ADMINPERCE", ""])
      var canvas = document.getElementById("doughnut-chart")
      canvas.style.display = 'none';
      this.piechart.destroy()
      this.piechart = null;
    }
  },
  components: {},
  computed: {}
};