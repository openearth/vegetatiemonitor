<template>
<v-expansion-panel class="v-selection-panel">
  <v-expansion-panel-content value=true>
    <v-toolbar class="toolbar " flat slot="header" color="grey lighten-4">
      <v-toolbar-title>
        Kaartlagen
      </v-toolbar-title>
    </v-toolbar>
    <v-expansion-panel class="panel">
      <draggable class="draggable" v-model="computedList" @start="drag=true" @end="drag=false" :options="{handle:'.header__icon'}">
        <v-expansion-panel-content v-for="layer in layers" :key="layer.id" focusable expand-icon="more_vert">
          <div class="header" slot="header">
            <v-list dense class="ma-1 pa-0">
              <v-list-tile class="ma-0 pa-0" v-on:click.stop=";">
                <v-list-tile-action>
                  <v-switch v-model="layer.active"></v-switch>
                </v-list-tile-action>
                <v-list-tile-title>{{layer.name}}
                </v-list-tile-title>
                <v-btn small :ripple='false' flat icon v-if='layer.download'  v-on:click.stop='downloadGeotiff(layer.name)'>
                  <v-icon>get_app</v-icon>
                </v-btn>
                <v-list-tile-avatar>
                  <img :src="layer.icon" />
                </v-list-tile-avatar>
              </v-list-tile>
            </v-list>
          </div>
          <div class="ma-0 pl-5 pr-5">
            <v-slider v-if="layer.opacity" hide-details class="pa-0 ma-0" title="transparantie" :min="1" :max="100" v-model="layer.opacity"></v-slider>
            <v-select v-if="layer.visualisations" :items="layer.visualisations" item-text="name" item-value="name" v-model="falseColor" item></v-select>
            <div v-if="layer.legend">
              <template v-if="layer.legend.range">
              <div v-if="layer.legend.colors" class="color-ramp" :style="colorRamp(layer.legend)" ></div>
              <div class='range-ramp'>{{layer.legend.range}}</div>
              </template>
              <template v-if="layer.legend.colors && layer.legend.labels">
              <div v-for="i in layer.legend.colors.length" :key="i" class="color-label"  >
                <span class="colored-span" :style="'background-color: ' + layer.legend.colors[i-1]"></span>
                <label class="ma-1" >{{layer.legend.labels[i-1]}}</label>
              </div>
              </template>
            </div>
            <iframe seamless v-if="layer.legendtable" :src="layer.legendtable" id="legendimg" ></iframe>
          </div>
        </v-expansion-panel-content>
      </draggable>
    </v-expansion-panel>
  </v-expansion-panel-content>
</v-expansion-panel>
</template>

<script src="./v-layer-control.js"></script>

<style scoped>
/* .layer-control {
  max-height: 50vh;
  overflow-y: auto;
} */

.draggable {
  width: 100%;
}

.color-ramp {
  height: 10px;
}

.range-ramp {
  text-align: justify;
  text-align-last: justify;
  width: 100%;
}

.color-label {
  display: flex;
}

.colored-span {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  margin: 4px;
}

#legendimg {
  width: 100%;
  height: 230px;
  border-width: 0;
}
</style>
