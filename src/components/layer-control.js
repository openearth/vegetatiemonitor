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
    }
  },
  mounted() {},
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
    }
  },
  methods: {
    sortLayers() {
      _.each(_.initial(this.layers), (layer, i) => {
        this.map.moveLayer(this.layers[i + 1].id, layer.id)
      })
    },
    toggleLayers() {
      if (_.isNil(this.map)) {
        return;
      }
      // Function to toggle the visibility of the layers.
      _.each(this.layers, (layer) => {
        var vis = "none"
        if (layer.active) {
          vis = "visible"
        }

        if (layer.type === 'group') {
          _.each(layer.data, (sublayer) => {
            this.map.setLayoutProperty(sublayer.id, "visibility", vis);
          })
        } else {
          this.map.setLayoutProperty(layer.id, "visibility", vis);
        }
      });
    }
  },
  components: {
    draggable
  }
};