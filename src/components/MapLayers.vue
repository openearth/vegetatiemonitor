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
        v-model="layers"
        @start="drag = true"
        @end="drag = false"
        :options="{ handle: '.draghandle' }"
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
                  <v-switch v-model="layer.active" />
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
            <div class="info" v-if="layer.info" color="none">
              <h4>Informatie</h4>
              {{ layer.info }}
              <v-divider />
            </div>
            <div class="legend" v-if="layer.legend">
              <template v-if="layer.legend.range">
                <div
                  v-if="layer.legend.colors"
                  class="color-ramp"
                  :style="colorRamp(layer.legend)"
                ></div>
                <div class="range-ramp">{{ layer.legend.range }}</div>
              </template>
              <template v-if="layer.legend.colors && layer.legend.labels">
                <div
                  v-for="i in layer.legend.colors.length"
                  :key="i"
                  class="color-label"
                >
                  <span
                    class="colored-span"
                    :style="'background-color: ' + layer.legend.colors[i - 1]"
                  ></span>
                  <label class="ma-1">{{ layer.legend.labels[i - 1] }}</label>
                </div>
              </template>
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
            <v-difference-legend v-if="layer.legendtable === 'difference'">
            </v-difference-legend>
          </div>
        </v-expansion-panel-content>
      </draggable>
    </v-expansion-panel>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  computed: {
    layers: {
      get() {
        return this.$store.state.layers
      },
      set(layers) {
        this.$store.commit('setMapLayers', layers)
      }
    }
  },
  data() {
    return {}
  },
  methods: {
    colorRamp(legend) {
      if (legend && legend.colors) {
        return `background: linear-gradient(to right, ${legend.colors.join()});`
      }
    }
  },
  components: {
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

.info {
  .wordwrap {
    white-space: pre-wrap; /* CSS3 */
    white-space: -moz-pre-wrap; /* Firefox */
    white-space: -pre-wrap; /* Opera <7 */
    white-space: -o-pre-wrap; /* Opera 7 */
    word-wrap: break-word; /* IE */
    background-color: none;
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
