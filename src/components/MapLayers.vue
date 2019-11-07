<template>
  <div>
    <v-layout column fill-height>
      <v-flex xs4 align-stretch>
        <h1 class="pa-4">
          Kaartlagen
        </h1>
        <v-expansion-panels dense focusable accordion>
          <draggable
            id="draggable"
            class="draggable"
            v-model="filteredLayers"
            @start="drag = true"
            @end="drag = false"
            v-bind="{ handle: '.draghandle' }"
          >
            <v-expansion-panel v-for="layer in filteredLayers" :key="layer.id">
              <v-expansion-panel-header class="pa-0">
                <!-- <div slot="header" > -->
                <v-layout align-center justify-space-end>
                  <v-flex>
                    <v-icon
                      class="ma-2 draghandle"
                      id="dragicon"
                      title="Drag to change map layer drawing order"
                      small
                      >fa-grip-vertical</v-icon
                    >
                  </v-flex>
                  <v-flex xs2 fill-height>
                    <v-img contain max-height="100%" :src="layer.icon" />
                  </v-flex>
                  <v-flex xs5 class="pa-1">
                    {{ layer.name }}
                  </v-flex>
                  <v-flex xs1>
                    <v-tooltip v-if="layer.timeslider" bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon small v-on="on">fa-clock</v-icon>
                      </template>
                      <span
                        >Deze laag is tijdsafhankelijk en kan bestuurd worden met de
                        tijdsbalk.</span
                      >
                    </v-tooltip>
                  </v-flex>
                  <v-flex xs2 @click.stop="">
                    <v-switch
                      class="ma-0"
                      v-model="layer.active"
                      @change="$emit('setLayer', layer)"
                    />
                  </v-flex>
                  <!-- <v-flex>
                    <v-icon class="ma-2" id="dragicon" title="Open details" small
                      >fa-caret-down</v-icon
                    >
                  </v-flex> -->
                </v-layout>
              </v-expansion-panel-header>
              <v-expansion-panel-content
                class="pa-0"
                extra-small
                expand-icon="fa-caret-down"
                hide-actions
              >
                <div class="pa-2">
                  <div class="infodiv" v-if="layer.info">
                    <h4>Informatie</h4>
                    {{ layer.info }}
                    <v-divider />
                  </div>
                  <v-legend v-if="layer.legend" :layer="layer"></v-legend>
                  <div class="opacity" v-if="layer.opacity">
                    <h4>Transparantie: {{ 100 - layer.opacity }}%</h4>
                    <v-slider
                      hide-details
                      class="pa-0 ma-0"
                      title="transparantie"
                      :min="1"
                      :max="100"
                      v-model="layer.opacity"
                    ></v-slider>
                    <v-divider />
                  </div>
                  <div class="settings" v-if="layer.settings">
                    <h4>Extra settings</h4>
                    <div v-for="setting in layer.settings" :key="setting.type">
                      <v-select
                        v-if="setting.type === 'select'"
                        dense
                        :items="setting.items"
                        item-text="name"
                        item-value="name"
                        v-model="setting.selected"
                        item
                      ></v-select>
                    </div>
                    <v-divider />
                  </div>
                  <difference-legend v-if="layer.legendtable === 'difference'">
                  </difference-legend>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </draggable>
        </v-expansion-panels>
      </v-flex>
      <v-flex grow>
        <div class="pa-4">
          <v-alert outlined type="warning" v-if="loadingLayers.length > 0">
            {{loadingMessage()}}
            <v-progress-linear
              color="orange accent-4"
              class="mt-4"
              indeterminate
              rounded
              height="6"
            ></v-progress-linear>
          </v-alert>
        </div>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import DifferenceLegend from './DifferenceLegend'
import VLegend from './VLegend'

export default {
  props: {
    loadingLayers: {
      type: Array
    },
    layers: {
      type: Array
    },
    modes: {
      type: Array
    },
    map: {
      type: Object
    }
  },
  data() {
    return {
      layerTypes: ['imageLayers', 'mapboxLayers']
    }
  },
  watch: {
    $route: {
      handler() {
        // this.updateFilteredLayers()
        this.toggleLayers()
      }
    },
    // Watch "layers". This is a switch, which can toggle a layer on or off
    // When toggled, this watcher will activate the toggleLayers function.
    layers: {
      deep: true,
      handler() {
        if (!this.layers) return
        this.toggleLayers()
        this.sortLayers()
      }
    },
    loadingLayers: {
      handler() {
        this.sortLayers()
      }
    }
  },
  computed: {
    filteredLayers: {
      get() {
        if (!this.layers) return []
        const layerNames = this.modes.find(
          mode => mode.name === this.$route.name
        ).mapLayersNames

        const layers = this.layers.filter(layer =>
          layerNames.includes(layer.name)
        )
        return layers
      },
      set(val) {
        this.$emit('setLayerOrder', val)
      }
    }
  },
  methods: {
    toggleLayers() {
      // When layers in the menu are switched on or off update the map layers
      if (!this.filteredLayers) return
      // Function to toggle the visibility and opacity of the layers.
      var vis = ['none', 'visible']

      // get the names of the layers that are available in this mode
      const layerNames = this.modes.find(mode => mode.name === this.$route.name)
        .mapLayersNames
      this.layers.forEach(layer => {
        this.layerTypes.forEach(data => {
          if (!layer[data]) return
          layer[data].forEach(sublayer => {
            if (!sublayer.id) return
            if (layer.active && layer.activeLayerType === data) {
              if (!layerNames.includes(layer.name)) {
                layer.active = false
                this.map.setLayoutProperty(sublayer.id, 'visibility', vis[0])
              }
              this.map.setLayoutProperty(sublayer.id, 'visibility', vis[1])
              this.setOpacity(layer, sublayer)
            } else {
              this.map.setLayoutProperty(sublayer.id, 'visibility', vis[0])
            }
          })
        })
      })
    },
    setOpacity(layer, sublayer) {
      // When updating the slider, update the corresponding layer with the new opacity
      if (layer.opacity) {
        try {
          var opacity = Math.max(layer.opacity * 0.01, 0.01)
          var property
          if (sublayer.type === 'raster') {
            property = 'raster-opacity'
          } else if (sublayer.type == 'fill') {
            property = 'fill-opacity'
          } else if (sublayer.type == 'line') {
            property = 'line-opacity'
          }
          if (property) {
            this.map.setPaintProperty(sublayer.id, property, opacity)
          }
        } catch (err) {
          console.log(
            'error setting opacity: ' + opacity + '(' + err.message + ')'
          )
        }
      }
    },
    sortLayers() {
      // Function to sort the layers according to their position in the menu
      for (var i = this.filteredLayers.length - 2; i >= 0; --i) {
        this.layerTypes.forEach(data => {
          if (!this.filteredLayers[i][data]) return
          for (
            var thislayer = 0;
            thislayer < this.filteredLayers[i][data].length;
            ++thislayer
          ) {
            if (this.filteredLayers[i][data][thislayer].id) {
              this.map.moveLayer(this.filteredLayers[i][data][thislayer].id)
            }
          }
        })
      }
    },
    loadingMessage() {
      return `De volgende lagen worden nog geladen: ${this.loadingLayers.join(', ')}.`
    }
  },
  components: {
    DifferenceLegend,
    draggable,
    VLegend
  }
}
</script>

<style>
#dragicon {
  margin: auto;
}

#draggable {
  width: 100%;
}

.v-expansion-panel {
  box-shadow: none;
  webkit-box-shadow: none;
}
.fa-grip-vertical:hover {
  color: black;
  cursor: grab;
}

.infodiv {
  .wordwrap {
    white-space: pre-wrap; /* CSS3 */
    white-space: -moz-pre-wrap; /* Firefox */
    white-space: -pre-wrap; /* Opera <7 */
    white-space: -o-pre-wrap; /* Opera 7 */
    word-wrap: break-word; /* IE */
  }
}

/* Customize the switch buttons */
.v-input--selection-controls:not(.v-input--hide-details) .v-input__slot {
  margin: auto;
}

.v-input--switch__track {
  border-radius: 9px;
  height: 16px;
  left: 2px;
  opacity: 0.6;
  position: absolute;
  right: 2px;
  top: calc(50% - 7px);
}

.v-input--switch__thumb {
  border-radius: 50%;
  top: calc(50% - 7px);
  height: 16px;
  position: relative;
  width: 16px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-shadow: none;
  box-shadow: none;
}

.v-input--switch.v-input--is-dirty .v-input--selection-controls__ripple,
.v-input--switch.v-input--is-dirty .v-input--switch__thumb {
  -webkit-transform: translate(20px, 0);
  transform: translate(20px, 0);
}

.theme--light.v-input--switch__thumb {
  color: #f8f8f8;
}
</style>
