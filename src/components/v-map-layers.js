import {
  bus
} from '@/event-bus.js';
import {
  mapLayers
} from './map-layers-config.js'
import {
  getGeeImage
} from './get-gee-layers.js'
export default {
  name: 'v-map-layers',
  data() {
    return {
      map: null,
      dateBegin: "2017-07-20",
      dateEnd: "2017-07-21",
      beginDate: "",
      endDate: "",
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
