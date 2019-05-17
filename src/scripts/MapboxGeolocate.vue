<template lang="html">
  <div></div>
</template>

<script>
import mapboxgl from 'mapbox-gl'

export default {
  name: 'mapbox-geolocate',
  data() {
    return {
      geolocate: null,
      map: null
    }
  },
  props: {
    options: {
      default: () => {
        return {}
      },
      type: Object
    }
  },
  watch: {
    $route(to, from) {
      console.log('rourting', to.name, from.name)
      if (to.name === 'Veld') {
        this.map.addControl(this.geolocate)
      } else {
        this.map.removeControl(this.geolocate)
      }
    }
  },
  mounted() {},
  methods: {
    deferredMountedTo(map) {
      this.map = map
      this.geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
      if (this.$route.name === 'Veld') {
        map.addControl(this.geolocate)
      }
    }
  }
}
</script>

<style lang="css" scoped></style>
