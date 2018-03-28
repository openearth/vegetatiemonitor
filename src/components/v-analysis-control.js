import _ from 'lodash';
import {
  bus
} from '@/event-bus.js';
import mapboxgl from 'mapbox-gl';
import Chart from 'chart.js'

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
          new Chart(canvas, {
            type: 'doughnut',
            data: {
              labels: ["Africa", "Asia", "Europe", "Latin America", "North America"],
              datasets: [{
                label: "Population (millions)",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
                data: [2478, 5267, 734, 784, 433]
              }]
            },
            options: {
              title: {
                display: true,
                text: 'Predicted world population (millions) in 2050'
              }
            }
          });
        }
      })
    })
  },
  methods: {
    closeSelectMode() {
      this.selectMode = false
      this.map.setFilter("KadasterSelect", ["==", "ADMINPERCE", ""])
      var canvas = document.getElementById("doughnut-chart")
      canvas.style.display = 'none';
    }
  },
  components: {},
  computed: {}
};
