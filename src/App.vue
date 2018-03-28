<template>
<v-app id="inspire">
  <v-navigation-drawer width=400 id="navdrawer" app v-model="drawer">
    <v-toolbar class="toolbar" flat >
      <v-toolbar-title>
        Kaartlagen
      </v-toolbar-title>
    </v-toolbar>
    <layer-control :layers="layers" :map="map"></layer-control>
    <analysis-panel :layers="layers" :map="map"></analysis-panel>
  </v-navigation-drawer>
  <v-toolbar xs6 color="grey lighten-4" fixed app>
    <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
    <v-toolbar-title>Vegetatie Monitor</v-toolbar-title>
    <v-spacer></v-spacer>
    <img class="logo1 mr-2" src="static/images/deltares.svg">
    <img class="logo2 mr-2" src="static/images/Rijkswaterstaat.svg">
  </v-toolbar>
  <v-content>
    <div id="map">
      <v-mapbox access-token="pk.eyJ1Ijoic2lnZ3lmIiwiYSI6Il8xOGdYdlEifQ.3-JZpqwUa3hydjAJFXIlMA" map-style="mapbox://styles/mapbox/light-v9" :center="[5.673272, 52.079502]" :zoom="7.88" :pitch="0" :bearing="0" :min-zoom="5" id="map" ref="map">
        <v-map-layers></v-map-layers>
        <v-mapbox-navigation-control></v-mapbox-navigation-control>
      </v-mapbox>
    </div>
  </v-content>
</v-app>
</template>

<script src="./app.js"></script>

<style>
@import 'mapbox-gl/dist/mapbox-gl.css';
@import 'material-design-icons/iconfont/material-icons.css';

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
  height: inherit !important;
  margin-top: 0px;
  max-height: none !important;
}

.list--dense .list__tile label {
  font-size: small !important;
}

label {
  font-size: small !important;
}

.expansion-panel__header {
  padding: 0px !important;
}

list__tile {
  padding: 0px !important;
}

.logo1 {
  height: 64px;
  width: 138px;
}

.logo2 {
  height: 64px;
  width: 192px;
}

.input-group__selections__comma {
  font-size: small !important;
}

input{
  font-size: small !important;
}

.list__tile__title {
  font-size: small !important;
}
.list__tile__avatar {
  min-width: 40px !important;
}
</style>
