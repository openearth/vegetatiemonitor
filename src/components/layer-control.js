import _ from 'lodash';
import draggable from 'vuedraggable'
import {
  bus
} from '@/event-bus.js';
export default {
  name: 'layer-control',
  props: {
    layers: {
      type: Array,
      required: true
    },
    map: {
      type: Object
    },
  },
  data: function() {
    return {
      firstImage: null
    };
  },
  computed: {
    computedList: {
      get() {
        return this.layers
      },
      set(layers) {
        bus.$emit('select-layers', layers)
      }
    }
  },
  watch: {
    // Watch "layers". This is a switch, which can toggle a layer on or off
    // When toggled, this watcher will activate the toggleLayers function.
    layers: {
      handler: function(layers) {
        this.toggleLayers();
        this.sortLayers()
      },
      deep: true
    },
    firstImage: {
      handler: function(firstImage) {
        this.toggleLayers();
      },
      deep: true
    }
  },
  mounted() {
    bus.$on('firstImage-changed', (firstImage) => {
      this.firstImage = firstImage
    })
  },
  methods: {
    sortLayers() {
      for (var i = this.layers.length - 2; i >= 0; --i) {
        for (var thislayer = 0; thislayer < this.layers[i].data.length; ++thislayer) {
          this.map.moveLayer(this.layers[i].data[thislayer].id)
        }
      }
    },
    toggleLayers() {
      if (_.isNil(this.map)) {
        return;
      }
      // Function to toggle the visibility of the layers.
      var vis = ['none', 'visible']

      _.each(this.layers, (layer) => {
        _.each(layer.data, (sublayer) => {
          if (layer.active && (layer.layertype == "mapbox-layer" ||
              (layer.layertype == "gee-layer" && sublayer.date === this.firstImage))) {
            this.map.setLayoutProperty(sublayer.id, "visibility", vis[1]);
          } else {
            this.map.setLayoutProperty(sublayer.id, "visibility", vis[0])
          }
        })
      });
    }
  },
  components: {
    draggable
  }
};
