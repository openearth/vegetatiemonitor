import {
  bus
} from '@/event-bus.js';
import {
  mapLayers
} from './map-layers-config.js'
import {
  getGeeSource
} from './getGeeSource.js'
export default {
  name: 'v-map-layers',
  data() {
    return {
      map: null,
      dateBegin: "2016-07-20",
      dateEnd: "2016-07-21",
      vis: {
        bands: ["red", "green", "blue"],
        gamma: 2.0
      }
    }
  },
  methods: {
    deferredMountedTo(map) {
      _.each(mapLayers, (layer) => {

        if (layer.layertype === 'mapbox-layer') {
          _.each(layer.data, (maplayer) => {
            map.addLayer(maplayer);
          })
          bus.$emit('add-layer', layer);
        } else if (layer.layertype === 'gee-layer') {
          getGeeSource(map, layer, this.dateBegin, this.dateEnd, this.vis)
        }
      })
    }
  }
}
