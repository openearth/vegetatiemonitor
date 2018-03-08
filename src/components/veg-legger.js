import {
  bus
} from '@/event-bus.js';


export default {
  name: 'v-veg-legger',
  data() {
    return {
      map: null,
    };
  },
  mounted() {},
  methods: {
    deferredMountedTo(map) {
      this.map = map
      var layer_vegetatie = {
        id: 'Vegetatielegger',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.87a2u39q',
        },
        'source-layer': 'vegetatie-vlakken-596nr3',
        paint: {
          'fill-color': {
            "base": 1,
            "type": "categorical",
            "property": "KLASSE",
            "stops": [
              [
                "Water",
                "rgba(191, 239, 255, 255)"
              ],
              [
                "Verhard oppervlak",
                "rgb(255, 129, 126)"
              ],
              [
                "Gras en Akker",
                "rgb(238, 250, 212)"
              ],
              [
                "Riet en Ruigte",
                "rgb(222, 189, 222)"
              ],
              [
                "Bos",
                "rgb(115, 191, 115)"
              ],
              [
                "Struweel",
                "rgb(217, 122, 54)"
              ],
              [
                "90-10",
                "rgb(255, 236, 128)"
              ],
              [
                "70-30",
                "rgb(242, 210, 24)"
              ],
              [
                "50-50",
                "rgb(217, 187, 22)"
              ]
            ],
            "default": "rgba(0, 0, 0, 0)"
          }
        },
        layout: {
          visibility: 'visible'
        },
      }

      var layer_beheer = {
        id: 'Beheersgrenzen',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.dbeqewih',
        },
        'source-layer': 'beheergrens-8l9whd',
        paint: {
          'line-color': 'rgb(80,155,255)'
        },
        layout: {
          visibility: 'visible'
        }
      }

      var group_json = {
        name: 'Vegetatielegger',
        icon: 'home',
        active: 'true',
        type: "group",
        data: [ layer_vegetatie, layer_beheer ],
      };

      this.map.addLayer(layer_vegetatie);
      this.map.addLayer(layer_beheer);
      bus.$emit('add-layer', group_json);

    }
  }

}
