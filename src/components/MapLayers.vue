<template>
  <div>
    <v-layout column fill-height>
      <v-flex xs4 align-stretch>
        <h1 class="pa-4">
          Kaartlagen
        </h1>
        <v-layout column class="scroll-panel ">
          <v-expansion-panels dense focusable multiple accordion>
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
                        class="pa-auto ma-0"
                        v-model="layer.active"
                        @change="$emit('setLayer', layer)"
                      />
                    </v-flex>
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
        </v-layout>
      </v-flex>
      <v-divider class="ma-2"/>
      <v-flex shrink>
        <div class="pa-1">
          <v-btn
            class="mb-1"
            v-show="classify.isShown()"
            :disabled="!classify.canClassify() || !this.classify.isZoomedEnough()"
            block
            outlined
            color="btncolor"
            @click="onClassify()"
          >
            Classificeren
          </v-btn>
          <v-alert outlined type="warning" v-show="!this.classify.isZoomedEnough() && this.classify.isShown()">
            Zoom-in at least to level {{ classify.minZoom }} to classify images, current zoom level is:
            {{ typeof(this.map.getZoom) !== 'undefined' && Math.floor(this.map.getZoom() * 10) / 10 }}.
          </v-alert>
          <v-alert outlined type="info" class="multi-line" v-show="this.classify.isZoomedEnough() && this.classify.canClassify() && this.classify.isShown()">
            {{ this.classify.getText() }}
          </v-alert>
        </div>
      </v-flex>

      <v-flex grow>
        <div class="pa-1">
          <v-alert outlined type="warning" v-show="loadingLayers.length">
            De volgende lagen worden nog geladen:
            <span
              v-for="(promise, index) in loadingLayers"
              :key="index"
              >
              {{ promise.name }}
              <v-progress-circular :color="timeSpanColor(promise)" :value="timeSpan(promise)" :size="12" :width="2" :rotate="-90"></v-progress-circular>
              <v-btn text icon x-small @click="abort(promise)"><v-icon>close</v-icon></v-btn>
            </span>

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
import moment from 'moment'
import draggable from 'vuedraggable'
import DifferenceLegend from './DifferenceLegend'
import VLegend from './VLegend'
import { getMapRegion } from '../utils'
import _ from 'lodash'

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
    },
    timeMode: {
      type: Object
    }
  },
  data() {
    return {
      layerTypes: ['imageLayers', 'mapboxLayers'],
      now: moment(),
      classify: {
        minZoom: 11, // minimum zoom level for classification
        last: null, // last classified image info
        layer: null,
        isShown: () => {
          return this.timeMode && this.timeMode.name === 'DAG'
        },
        canClassify: () => {
          return !(this.classify.layer && this.classify.layer.classificationMessage.startsWith('De huidige'))
        },
        isZoomedEnough: () => {
          return typeof(this.map.getZoom) !== 'undefined' && this.map.getZoom() >= this.classify.minZoom
        },
        getText: () => {
          if(!this.classify.layer) {
            return 'Selecteer een beeld en druk op CLASSIFICEREN om het beeld te classificeren.'
          } else {
            return this.classify.layer.classificationMessage
          }
        }
      }
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
  mounted () {
    // keep updating now
    setInterval(() => {this.now = moment()}, 1000)
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
    onClassify() {
      let layers = this.layers.filter(l => l.customExtent)

      layers.map(l => {
        l.needsUpdate = true
        l.classificationRegion = getMapRegion(this.map)

        if(l.name === 'Classificatie') {
          l.active = true

          this.classify.layer = l
          this.classify.layer.classificationMessage = "De huidige beeld wordt geclassifeceerd ..."
        }

        this.$emit('setLayer', l)
      })
    },
    abort(promise) {
      promise.controller.abort()
      let promises = [...this.loadingLayers]
      _.pull(promises,  promise)
      this.$emit('update:loadingLayers', promises)
    },
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
            if (!this.map.getSource(sublayer.id)) return
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

      let previousId = null

      // Function to sort the layers according to their position in the menu
      this.filteredLayers.forEach((filterLayer, i) => {
        this.layerTypes.forEach(type => {
          if (!filterLayer[type]) return
          filterLayer[type].forEach((dataLayer, j) => {
            const mapId = dataLayer.id
            if (!previousId) {
              previousId = mapId
            }
            if (mapId && this.map.getSource(mapId)) {
              this.map.moveLayer(mapId, previousId)
              previousId = mapId
            }
          })
        })
      })
    },
    timeSpan(promise) {
      let diff = this.now.diff(promise.start)
      return Math.min(diff / 20000, 1) * 100
    },
    timeSpanColor(promise) {
      let diff = this.now.diff(promise.start)
      if (diff < 5000) {
        return 'success'
      } else if (diff < 20000) {
        return 'info'
      } else {
        return 'error'
      }
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

.scroll-panel {
  overflow-y: auto;
  overflow-x: hidden;
  height: 60vh;
}

.scroll-panel::-webkit-scrollbar-track {
  background: #ddd;
  border-radius: 20px;
}

.scroll-panel::-webkit-scrollbar {
  width: 8px;
}

.scroll-panel::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 20px;
}

.multi-line {
  white-space: pre-line;
}

.v-messages {
  display: none;
}
</style>
