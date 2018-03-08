import {
  bus
} from '@/event-bus.js';

export default {
  name: 'v-streamlines',
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
        id: 'Streamlines',
        name: 'Stroombanen',
        icon: 'home',
        active: 'true',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.4puwiyv9',
        },
        'source-layer': 'stroombaan-8ndp71',
        paint: {
          'fill-color': 'rgba(51, 163, 255, 0.2)',
          'fill-outline-color': 'rgba(51, 163, 255, 1)'
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
