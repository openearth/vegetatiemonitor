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
                <v-icon>{{layer.icon}}</v-icon>
              </v-list-tile-avatar>
            </v-list-tile>
          </v-list>
        </div>
        <div class="ma-0 pl-3 pr-5">
          <v-slider hide-details class="pa-0 ma-0" title="opacity:" label="opacity" :min="1" :max="100" v-model="layer.opacity" v-if="layer.opacity"></v-slider>
          <!-- <div :style="layer.css" class='bar' v-if="layer.css"></div>
          <div class='bartext'>{{layer.range}} <span class='barspan'> </span> </div>
          <div class='information' v-html="layer.info">{{layer.info}} </div> -->
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
.bartext {
  text-align: justify;
  width: 100%;
  clear: left;
}
.bar {
  width: 100%;
  height: 10px;
}

.barspan {
  width: 100%;
  display: inline-block;
}

.information {
  /* TODO: remove span trick? */
  margin-top: -1rem;
  text-align: left;
}

</style>
