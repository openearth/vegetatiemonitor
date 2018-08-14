<template>
<v-app id="inspire">
  <v-disclaimer></v-disclaimer>
  <v-navigation-drawer width=400 id="navdrawer" app v-model="drawer">
    <v-layer-control :layers="layers" :map="map"></v-layer-control>
    <v-selection-panel :layers="layers" :map="map" :selection="selection"></v-selection-panel>
    <v-analysis-control :layers="layers" :map="map" :selection="selection"></v-analysis-control>
    <v-colofon></v-colofon>
  </v-navigation-drawer>
  <v-toolbar xs6 color="grey lighten-4" fixed app>
    <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
    <v-toolbar-title>Vegetatie Monitor</v-toolbar-title>
    <v-spacer></v-spacer>
    <div class="logos"><img class="logos" src="static/images/deltares.svg"></div>
    <div class="logos"><img class="logos" src="static/images/Rijkswaterstaat.svg"></div>
  </v-toolbar>
  <v-content>
    <div id="map">
      <v-mapbox access-token="pk.eyJ1Ijoic2lnZ3lmIiwiYSI6Il8xOGdYdlEifQ.3-JZpqwUa3hydjAJFXIlMA" map-style="mapbox://styles/mapbox/light-v9" :center="[5.673272, 52.079502]" :zoom="7.88" :pitch="0" :bearing="0" :min-zoom="5" id="map" ref="map">
        <v-map-layers></v-map-layers>
        <v-mapbox-geocoder></v-mapbox-geocoder>
        <v-mapbox-navigation-control></v-mapbox-navigation-control>
      </v-mapbox>
    </div>
  </v-content>
</v-app>
</template>

<script src="./app.js"></script>

<style>
@import 'mapbox-gl/dist/mapbox-gl.css';
@import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
@import 'material-design-icons/iconfont/material-icons.css';

html, doc {
  overflow: hidden;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  font-size: smaller !important;
}

#map {
  height: 100%;
  width: 100%;
}

#navdrawer {
  height: 100vh !important;
  max-height: inherit !important;
  overflow-y: auto !important;
}

label {
  font-size: small !important;
}

.v-expansion-panel__header {
  padding: 0px !important;
}

.logos {
  position: relative;
  display: inline-block;
  overflow: hidden;
  height: 100% !important;
  max-height: 100%;
}

.input-group__selections__comma,
.v-select__selection--comma,
.list--dense, .list__tile,
label, v-list__tile,
list__tile, input,
.list__tile__title {
  font-size: small !important;
  padding-top: 5px;
}

.expansion-panel__header {
  padding: 0px !important;
}

.list__tile__avatar {
  min-width: 40px !important;
}

</style>
