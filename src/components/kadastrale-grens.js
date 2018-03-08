import {
  bus
} from '@/event-bus.js';

export default {
  name: 'v-kadastrale-grens',
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
        id: 'Kadaster',
        name: 'Kadaster',
        icon: 'home',
        active: 'true',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.5tu1qjtk',
        },
        'source-layer': 'kadaster-vlakken-1i9erw',
        paint: {
          'fill-color': 'rgba(32, 32, 32, 0.3)',
          'fill-outline-color': 'rgba(0, 0, 0, 0.3)'
        },
        layout: {
          visibility: 'visible',
        },

      }
      this.map.addLayer(layer_json);
      bus.$emit('add-layer', layer_json);

    }
  },


}
