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
  watch: {
    // Watch "layers". This is a switch, which can toggle a layer on or off
    // When toggled, this watcher will activate the toggleLayers function.
    layers: {
      handler: function(layers) {
      },
      deep: true
    }
  },
  methods: {  },
  components: {
  }
};
