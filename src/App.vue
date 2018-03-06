<template>
<v-app id="inspire">
  <v-navigation-drawer fixed app v-model="drawer">
    <v-toolbar flat>
      <v-list>
        <v-list-tile>
          <v-list-tile-title class="title">
            Layers
          </v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-toolbar>
  </v-navigation-drawer>
  <layer-control :layers="layers" :map="map"></layer-control>
  <v-toolbar color="indigo" dark fixed app>
    <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
    <v-toolbar-title>Safer schools viewer</v-toolbar-title>
  </v-toolbar>
  <v-content>
    <div id="map">

      <v-mapbox
      access-token="pk.eyJ1Ijoic2lnZ3lmIiwiYSI6Il8xOGdYdlEifQ.3-JZpqwUa3hydjAJFXIlMA"
      map-style="mapbox://styles/mapbox/satellite-streets-v10"
      :center="[5.673272, 52.079502]"
      :zoom="7.88" :pitch="40.00" :bearing="0" :min-zoom="5"
        id="map" ref="map">
        <v-veg-legger ref="veglegger"></v-veg-legger>
      </v-mapbox>
    </div>
  </v-content>
  <v-footer color="indigo" app>
    <span class="white--text">&copy; 2017</span>
  </v-footer>
</v-app>
</template>

<script src="./app.js"></script>

<style >
@import 'mapbox-gl/dist/mapbox-gl.css';
@import 'material-design-icons/iconfont/material-icons.css';
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
}
#map {
  height: 100vh;
  width: 100%;
}
</style>
