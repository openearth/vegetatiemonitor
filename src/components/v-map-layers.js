import {
  bus
} from '@/event-bus.js';
import {
  mapLayers
} from './map-layers-config.js'

export default {
  name: 'v-map-layers',
  data() {
    return {
      map: null
    }
  },
  methods: {
    deferredMountedTo(map) {
      _.each(mapLayers, (layer) => {
        bus.$emit('add-layer', layer);
        if (layer.layertype === 'mapbox-layer') {
          _.each(layer.data, (maplayer) => {
            map.addLayer(maplayer);
          })
        }
      })
    }
  }
}
