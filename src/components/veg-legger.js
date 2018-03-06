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
      var layer_json = {
        id: 'Vegetatielegger',
        name: 'Vegetatielegger',
        icon: 'home',
        active: 'true',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.bjwxtnwf',
        },
        'source-layer': 'vegetatie-vlakken-WM-3uqyuf',
        paint: {
          'fill-color': 'rgba(52, 220, 58, 0.26)',
          'fill-outline-color': 'rgba(52, 220, 58, 1)'
        },
        layout: {
          visibility: 'visible'
        },
        minzoom: 0,
        maxzoom: 22
      }
      this.map.addLayer(layer_json);
      bus.$emit('add-layer', layer_json);

    }
  }

}
