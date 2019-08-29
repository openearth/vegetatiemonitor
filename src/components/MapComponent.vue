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
      <div id="t-slider">
        <time-slider ref="timeslider" :layers="timesliderLayers"> </time-slider>
      </div>
    </v-mapbox>
  </div>
</template>

<script>
import MapboxGeolocate from '../scripts/MapboxGeolocate'
import TimeSlider from './TimeSlider'

export default {
  name: 'map-component',
  props: {
    layers: {
      type: Array,
      required: true
    },
    dateBegin: {
      type: String,
      required: true
    },
    dateEnd: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      map: null,
      region: {
        coordinates: [
          [
            [4.54, 52.71],
            [4.17, 50.75],
            [6.2, 50.7],
            [6.44, 52.68],
            [4.54, 52.71]
          ]
        ],
        geodesic: true,
        type: 'Polygon'
      },
      polygons: [],
      scale: 10
    }
  },
  watch: {
    // Watch "layers". This is a switch, which can toggle a layer on or off
    // When toggled, this watcher will activate the toggleLayers function.
    layers: {
      deep: true,
      handler() {
        this.toggleLayers()
        this.sortLayers()
      }
    }
  },
  computed: {
    timesliderLayers() {
      return this.layers.filter(layer => layer.timeslider && layer.active)
    }
  },
  mounted() {
    this.$on('update-timeslider', timeExtent => {
      this.beginDate = timeExtent[0]
      this.endDate = timeExtent[1]
    })
    this.map = this.$refs.map.map
    this.map.on('load', () => {
      window.map = this.map
      this.$emit('setMap', this.map)
      this.addMapboxLayers()
      this.updateLayers()
    })
  },
  provide() {
    return {
      getMap: () => {
        return this.map
      }
    }
  },
  methods: {
    deferredMountedTo(map) {
      console.log(map)
    },
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
    updateGEELayers(dataset, region, vis) {
      var map_id = `${dataset}_${this.dateBegin}`
      if (this.map.getSource(map_id)) {
        this.map.removeLayer(map_id)
        this.map.removeSource(map_id)
      } else {
        var maplayer_json = {
          id: map_id,
          type: 'raster',
          date: this.dateBegin,
          source: {
            type: 'raster',
            tiles: [],
            tileSize: 256
          }
        }

        var json_body = {
          dateBegin: this.dateBegin,
          dateEnd: this.dateEnd,
          region: region,
          vis: vis
        }
        fetch(`${this.$store.state.SERVER_URL}/map/${dataset}/`, {
          method: 'POST',
          body: JSON.stringify(json_body),
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(res => {
            return res.json()
          })
          .then(mapUrl => {
            maplayer_json.source['tiles'] = [mapUrl['url']]
            this.map.addLayer(maplayer_json)
            var menulayer = this.layers.find(l => l.dataset === dataset)
            menulayer.data.push(maplayer_json)
          })
      }
    },
    updateLayers() {
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

    setOpacity(layer, sublayer) {
      if (layer.opacity) {
        try {
          var opacity = Math.max(layer.opacity * 0.01, 0.01)
          var property
          if (layer.layertype == 'gee-layer') {
            property = 'raster-opacity'
          } else if (sublayer.type == 'fill') {
            property = 'fill-opacity'
          } else if (sublayer.type == 'line') {
            property = 'line-opacity'
          }
          if (property) {
            this.map.setPaintProperty(sublayer.id, property, opacity)
          }
        } catch (err) {
          console.log(
            'error setting opacity: ' + opacity + '(' + err.message + ')'
          )
        }
      }
    },

    toggleLayers() {
      // Function to toggle the visibility and opacity of the layers.
      var vis = ['none', 'visible']
      this.layers.forEach(layer => {
        if (layer.layertype === 'gee-layer' && layer.active) {
          this.updateGEELayers(layer.dataset, this.region, layer.vis)
        } else if (layer.layertype === 'mapbox-layer') {
          layer.data.forEach(sublayer => {
            if (layer.active) {
              this.map.setLayoutProperty(sublayer.id, 'visibility', vis[1])
              this.setOpacity(layer, sublayer)
            } else {
              this.map.setLayoutProperty(sublayer.id, 'visibility', vis[0])
            }
          })
        }
      })
    }
  },
  components: {
    MapboxGeolocate,
    TimeSlider
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

#t-slider {
  position: absolute;
  left: 20vw;
  bottom: 5vh;
  width: 70vw;
  right: 90vw;
  z-index: 2;
  background-color: #f0f0f0;
}
</style>
