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
          url: 'mapbox://ellispenning.0daxuyc8',
        },
        'source-layer': 'kadaster-WM-3qwzj5',
        paint: {
          'fill-color': 'pink',
          'fill-outline-color': 'rgba(52, 220, 58, 1)'
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
