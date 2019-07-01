<template lang="html">
  <div></div>
</template>

<script>
import mapboxgl from 'mapbox-gl'

export default {
  name: 'mapbox-geolocate',
  inject: ['getMap'],
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
  beforeDestroy() {
    let map = this.getMap()
    console.log(map)
    if (map) {
      map.removeControl(this.geolocate)
    }
  },
  // watch: {
  //   $route(to, from) {
  //     if (to.name === 'Veld') {
  //       this.map.addControl(this.geolocate)
  //     } else {
  //       this.map.removeControl(this.geolocate)
  //     }
  //   }
  // },
  mounted() {
    console.log('mounted')
  },
  methods: {
    deferredMountedTo(map) {
      console.log('deferredMountedTo')
      this.map = map
      this.geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
      // if (this.$route.name === 'Veld') {
      map.addControl(this.geolocate)
      // }
    }
  }
}
</script>

<style lang="css" scoped></style>
