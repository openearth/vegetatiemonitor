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
          value: 'name'
        },
        {
          text: 'Kwantiteit',
          value: 'data'
        }
      ],
      items: [],
      polygonSelected: false
    }
  },
  mounted() {
    bus.$on('map-loaded', (event) => {
      this.map.on('mousemove', (e) => {
        this.map.getCanvas().style.cursor = '';
        var features_list = this.map.queryRenderedFeatures(e.point);
        this.map.setFilter("kadasterlijnen", ["==", "name", ""]);
        // Check if Kadaster layer is on top
        if (_.find(features_list[0], {
            'id': 'Kadaster'
          }) !== undefined) {
          this.map.getCanvas().style.cursor = 'pointer';
          this.map.setFilter("kadasterlijnen", ["==", "name", e.features[0].properties.name]);

          var kadasterLayer = _.find(this.layers, {
            'name': 'Kadaster'
          })
          this.items = []
          _.each(kadasterLayer.tableproperties, (prop) => {
            this.items.push({
              value: false,
              name: prop.name,
              data: features_list[0].properties[prop.key]
            })
          })
        }
      })

      var popup = new mapboxgl.Popup({})
      this.map.on('click', (e) => {
        popup.remove()
        var features_list = this.map.queryRenderedFeatures(e.point);
        var feature = _.find(features_list[0], {
          'id': 'Kadaster'
        })
        if (feature !== undefined) {
          new Chart(document.getElementById("doughnut-chart"), {
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
  watch: {},
  methods: {},
  components: {}
};
