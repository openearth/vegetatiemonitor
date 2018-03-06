import _ from 'lodash';

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
    return {};
  },
  mounted() {},
  watch: {
    // Watch "layers". This is a switch, which can toggle a layer on or off
    // When toggled, this watcher will activate the toggleLayers function.
    layers: {
      handler: function(layers) {
        this.toggleLayers();
      },
      deep: true
    }
  },
  methods: {
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
  }
};
