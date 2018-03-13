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
  data() {
    return {
      beginDate: null,
      endDate: null,
      beginMenu: false,
      endMenu: false,
      modal: false,
      firstImage: null,
      secondImage: null,
      imageMode: false,
      Image1: [],
      Image2: []
    };
  },  mounted() {},
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
