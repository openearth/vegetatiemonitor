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
      firstImage: null,
      falseColor: 'Natural colors'
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
    },
    // apply false color scheme to satellite layer(s)
    falseColor: {
      handler: function(falseColor) {
        this.setFalseColor(falseColor);
      }
    }
  },
  mounted() {
    bus.$on('firstImage-changed', (firstImage) => {
      this.firstImage = firstImage;
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
      // Function to toggle the visibility and opacity of the layers.
      var vis = ['none', 'visible']

      _.each(this.layers, (layer) => {
        _.each(layer.data, (sublayer) => {
          if (layer.active && (layer.layertype == "mapbox-layer" ||
              (layer.layertype == "gee-layer" && sublayer.date === this.firstImage))) {
                this.map.setLayoutProperty(sublayer.id, "visibility", vis[1]);
                this.setOpacity(layer, sublayer);
          } else {
            this.map.setLayoutProperty(sublayer.id, "visibility", vis[0]);
          }
        })
      });
    },
    setOpacity(layer, sublayer) {
      if (layer.opacity) {
        try {
          var opacity = Math.max(layer.opacity * 0.01, 0.01);
          var property;
          if (layer.layertype == "gee-layer") {
            property = "raster-opacity";
          } else if (sublayer.type == "fill") {
            property = "fill-opacity";
          } else if (sublayer.type == "line") {
            property = "line-opacity";
          }
          if (property) {
            this.map.setPaintProperty(sublayer.id, property, opacity);
          }
        } catch(err) {
          console.log("error setting opacity: " + opacity + "(" + err.message + ")");
        }
      }
    },
    setFalseColor(name) {
      _.each(this.layers, (layer) => {
        if (layer.visualisations) {
          layer.vis = layer.visualisations.find(v => v.name == this.falseColor).vis
        }
      })
      bus.$emit('change-false-color', name)
    },
    colorRamp(legend) {
      if (legend && legend.colors) {
        return "background: linear-gradient(to right, " + legend.colors.join() + ");"
      }
    }
  },
  components: {
    draggable
  }
};
