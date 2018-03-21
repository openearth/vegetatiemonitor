<template>
<div class="layer-control">
  <v-expansion-panel class="">
    <draggable :options="{handle:'.header'}" class="draggable" v-model="computedList" @start="drag=true" @end="drag=false">
      <v-expansion-panel-content v-for="layer in layers" :key="layer.id">
        <div class="header" slot="header">
          <v-list dense class="ma-0 pa-0" >
            <v-list-tile class="ma-0 pa-0"> 
              <v-list-tile-action >
                <v-switch v-model="layer.active"></v-switch>
              </v-list-tile-action>
              <v-list-tile-title>{{layer.name}}</v-list-tile-title>
              <v-list-tile-avatar>
                <img :src="layer.icon"/>
              </v-list-tile-avatar>
            </v-list-tile>
          </v-list>
        </div>
        <div class="ma-0 pl-5 pr-5">
          <v-slider v-if="layer.opacity" hide-details class="pa-0 ma-0" title="transparantie" :min="1" :max="100" v-model="layer.opacity"></v-slider>
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
        </div>
      </v-expansion-panel-content>
    </draggable>
  </v-expansion-panel>
</div>
</template>

<script src="./layer-control.js"></script>

<style scoped>
.layer-control {
  max-height: 50vh;
  overflow-y: auto;
}
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
</style>
