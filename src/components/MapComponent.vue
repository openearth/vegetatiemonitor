<template>
  <div id="map">
    <v-mapbox
      access-token="pk.eyJ1Ijoic2lnZ3lmIiwiYSI6Il8xOGdYdlEifQ.3-JZpqwUa3hydjAJFXIlMA"
      map-style="mapbox://styles/mapbox/light-v9"
      :center="[5.673272, 52.079502]"
      :zoom="7.88"
      :pitch="0"
      :bearing="0"
      :min-zoom="5"
      id="map"
      ref="map"
    >
      <v-mapbox-geocoder></v-mapbox-geocoder>
      <v-mapbox-navigation-control></v-mapbox-navigation-control>
    </v-mapbox>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'

export default {
  name: 'map-component',
  data: function() {
    return {
      map: null
    }
  },
  mounted() {
    this.map = this.$refs.map.map
    this.map.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
      })
    )
  }
}
</script>

<style>
@import '~mapbox-gl/dist/mapbox-gl.css';
@import '~mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

#map {
  width: 100%;
  height: 100%;
}
</style>
