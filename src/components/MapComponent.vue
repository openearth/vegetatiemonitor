<template>
  <div class="map">
    <v-mapbox
      access-token="pk.eyJ1Ijoic2lnZ3lmIiwiYSI6Il8xOGdYdlEifQ.3-JZpqwUa3hydjAJFXIlMA"
      map-style="mapbox://styles/mapbox/light-v9"
      :center="[5.673272, 52.079502]"
      :zoom="7.88"
      :pitch="0"
      :bearing="0"
      :min-zoom="5"
      class="map"
      ref="map"
    >
      <v-mapbox-geocoder />
      <v-mapbox-navigation-control />
      <mapbox-geolocate />
    </v-mapbox>
  </div>
</template>

<script>
import MapboxGeolocate from '../scripts/MapboxGeolocate'
// import { map/tate } from 'vuex'

export default {
  name: 'map-component',
  props: {
    layers: {
      type: Array,
      required: true
    }
  },
  data: function() {
    return {
      map: null
    }
  },
  // computed: mapState(['layers']),
  // watch: {
  //   layers(newValue, oldValue) {
  //     // this.updateLayers()
  //   }
  // },
  mounted() {
    this.map = this.$refs.map.map
    this.map.on('load', () => {
      this.addMapboxLayers()
    })
  },
  provide() {
    return {
      getMap: () => {
        console.log('getting the map')
        return this.map
      }
    }
  },
  methods: {
    addMapboxLayers() {
      this.layers.forEach(layer => {
        if (layer.layertype === 'mapbox-layer') {
          layer.data.forEach(maplayer => {
            if (!this.map.getSource(maplayer)) {
              this.map.addLayer(maplayer)
            }
          })
        }
      })
    },
    addGEELayers() {
      console.log('adding GEE layers')
    },
    updateLayers() {
      console.log('this.map', this.map)
      if (this.map) {
        this.sortLayers()
        this.toggleLayers()
      }
    },
    sortLayers() {
      // Function to sort the layers according to their position in the menu
      for (var i = this.layers.length - 2; i >= 0; --i) {
        for (
          var thislayer = 0;
          thislayer < this.layers[i].data.length;
          ++thislayer
        ) {
          this.map.moveLayer(this.layers[i].data[thislayer].id)
        }
      }
    },
    toggleLayers() {
      // Function to toggle the visibility and opacity of the layers.
      var vis = ['none', 'visible']

      this.layers.forEach(layer => {
        layer.data.each(sublayer => {
          if (layer.active) {
            this.map.setLayoutProperty(sublayer.id, 'visibility', vis[1])
            this.setOpacity(layer, sublayer)
          } else {
            this.map.setLayoutProperty(sublayer.id, 'visibility', vis[0])
          }
        })
      })
    }
  },
  components: {
    MapboxGeolocate
  }
}
</script>

<style>
@import '~mapbox-gl/dist/mapbox-gl.css';
@import '~mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

.map {
  width: 100%;
  height: 100%;
}
</style>
