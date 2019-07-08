<template>
  <div>
    <v-card small flat>
      <v-card-title>
        <h1>
          Kaartlagen
        </h1>
      </v-card-title>
    </v-card>

    <v-expansion-panel focusable dense flat>
      <draggable
        id="draggable"
        class="draggable"
        v-model="mapLayers"
        @start="drag = true"
        @end="drag = false"
        v-bind="{ handle: '.draghandle' }"
      >
        <v-expansion-panel-content
          class="ma-0 pa-0"
          v-for="layer in layers"
          :key="layer.id"
          extra-small
          expand-icon="fa-caret-down"
          hide-actions
        >
          <div slot="header" class="carddiv pa-1">
            <v-card class="carddiv">
              <v-layout align-center justify-space-end fill-height>
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
                <v-flex xs7>
                  {{ layer.name }}
                </v-flex>
                <v-flex xs2 @click.stop="">
                  <v-switch
                    v-model="layer.active"
                    @change="$store.commit('setMapLayers', layers)"
                  />
                </v-flex>
                <v-flex>
                  <v-icon class="ma-2" id="dragicon" title="Open details" small
                    >fa-caret-down</v-icon
                  >
                </v-flex>
              </v-layout>
            </v-card>
          </div>
          <div class="pa-2">
            <div class="infodiv" v-if="layer.info">
              <h4>Informatie</h4>
              {{ layer.info }}
              <v-divider />
            </div>
            <div class="legend" v-if="layer.legend">
              <h4>Legenda</h4>
              <template v-if="layer.legend.range">
                <div
                  v-if="layer.legend.colors"
                  class="color-ramp"
                  :style="
                    `background: linear-gradient(to right, ${layer.legend.colors.join()});`
                  "
                ></div>
                <div class="range-ramp">{{ layer.legend.range }}</div>
              </template>
              <div
                v-if="layer.legend.colors && layer.legend.labels"
                class="legend-colors"
              >
                <v-layout wrap class="color-label">
                  <v-layout
                    align-center
                    v-for="(color, index) in layer.legend.colors"
                    :key="index"
                  >
                    <span
                      class="colored-span"
                      :style="`background-color: ${color}`"
                    ></span>
                    <label class="ma-1">{{ layer.legend.labels[index] }}</label>
                  </v-layout>
                </v-layout>
              </div>
              <v-divider />
            </div>
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
      </draggable>
    </v-expansion-panel>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import DifferenceLegend from './DifferenceLegend'

export default {
  props: {
    layers: {
      type: Array,
      required: true
    }
  },
  data() {
    return {}
  },
  computed: {
    mapLayers: {
      get() {
        return this.layers
      },
      set(mapLayers) {
        this.$emit('setLayers', mapLayers)
      }
    }
  },
  methods: {},
  components: {
    DifferenceLegend,
    draggable
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
.carddiv {
  width: 100%;
  height: 100%;
}

.color-ramp {
  height: 10px;
}
.range-ramp {
  text-align: justify;
  text-align-last: justify;
  width: 100%;
}

.legend-colors {
  display: inline-block;
}

.colored-span {
  width: 20px;
  height: 20px;
  border-radius: 5px;
}

.v-expansion-panel {
  box-shadow: none;
  webkit-box-shadow: none;
}
.v-expansion-panel__header {
  padding: 0;
  height: 48px;
}

.theme--light.v-expansion-panel .v-expansion-panel__container {
  border-top: none;
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
