<template>
<div class="layer-control">
  <draggable v-model='computedList' @start="drag=true" @end="drag=false">
  <v-list dense pt-0 v-for="layer in layers" :key="layer.id">
    <v-list-tile>
      <v-list-tile-action>
        <v-switch v-model="layer.active"></v-switch>
      </v-list-tile-action>
      <v-list-tile-title>{{layer.name}}</v-list-tile-title>
      <v-list-tile-action>
        <v-icon>{{layer.icon}}</v-icon>
      </v-list-tile-action>
    </v-list-tile>

    <div class="bar-wrapper">
      <div :style="layer.css" class='bar' v-if="layer.css"></div>
      <div class='bartext'>{{layer.range}} <span class='barspan'> </span> </div>
      <div class='information' v-html="layer.info" >{{layer.info}} </div>
    </div>
  </v-list>
</draggable>

</div>
</template>

<script src="./layer-control.js"></script>

<style scoped>
.layer-control {
  overflow-y: scroll;
  height:50vh;
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
.bar-wrapper {
  padding: 0 16px;
  display: block;
  width: 100%;
  margin-bottom: 10px;
}
.legend .list__tile {
  height: 200px;
}
</style>
