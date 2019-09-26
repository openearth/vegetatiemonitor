<template>
  <div class="map">
    <v-mapbox
      access-token="pk.eyJ1Ijoic2lnZ3lmIiwiYSI6Il8xOGdYdlEifQ.3-JZpqwUa3hydjAJFXIlMA"
      map-style="mapbox://styles/mapbox/light-v9"
      :center="center"
      :zoom="9"
      :pitch="0"
      :bearing="0"
      :min-zoom="5"
      class="map"
      ref="map"
      id="map"
    >
      <v-mapbox-geocoder></v-mapbox-geocoder>
      <v-mapbox-navigation-control></v-mapbox-navigation-control>
      <v-mapbox-geolocate-control></v-mapbox-geolocate-control>
    </v-mapbox>
    <v-card
      class="t-slider"
      :id="[openDrawer ? 'small-slider' : 'big-slider']"
      color="secondary">
      <time-slider
        ref="timeslider"
        :layers="timesliderLayers"
        :modes="modes"
        @update:time-mode="$emit('update:time-mode', $event)"
        @update-timeslider="updateTimeslider($event)"
      >
      </time-slider>
    </v-card>
  </div>
</template>

<script>
import TimeSlider from './TimeSlider'
import moment from 'moment'

export default {
  name: 'map-component',
  props: {
    openDrawer: {
      type: Boolean
    },
    layers: {
      type: Array
    },
    dateBegin: {
      type: String,
      required: true
    },
    dateEnd: {
      type: String,
      required: true
    },
    modes: {
      type: Array
    },
    timeMode: {
      type: Object
    }
  },
  data: function() {
    return {
      center: [5.2, 51.8],
      map: null,
      layerTypes: ['imageLayers', 'mapboxLayers'],
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
  computed: {
    timesliderLayers() {
      if (!this.layers) return
      return this.layers.filter(layer => layer.timeslider && layer.active)
    }
  },
  mounted() {
    this.map = this.$refs.map.map
    this.map.on('load', () => {
      this.$emit('update:map', this.map)
      this.addMapboxLayers()
      // this.updateGEELayers()
      this.fetchDates()
      this.map.on('zoomend', this.fetchDates)
      this.map.on('dragend', this.fetchDates)
      this.updateTimedLayers([this.beginDate, this.endDate])

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
    deferredMountedTo() {},
    updateTimeslider(event) {
      const extent = [
        event.beginDate,
        event.endDate
      ]
      this.$emit('update:dateBegin', extent[0])
      this.$emit('update:dateEnd', extent[1])

      this.timing = event.timing
      this.dragging = event.dragging
      this.updateTimedLayers(extent)
    },
    addMapboxLayers() {
      this.layers.forEach(layer => {
        layer.mapboxLayers.forEach(maplayer => {
          if (!maplayer.id) return
          if (!this.map.getSource(maplayer)) {
            this.map.addLayer(maplayer)
          }
        })
      })
    },
    updateTimedLayers(extent) {
      this.layers.forEach(layer => {
        if (layer.timeslider) {
          // If layer is not active, return
          if (!layer.active) return
          if (this.timing === 'DAG' && this.dragging === false) {
            this.updateImageLayer(layer, extent)
            layer.activeLayerType = 'imageLayers'
          } else if (this.timing === 'JAAR') {
            const videoLayer = layer.mapboxLayers.find(d => {
              if (!d.source) {
                return false
              } else {
                return d.source.type === 'video-tiled'
              }
            })
            if (videoLayer) {
              this.updateVideoLayerTime(videoLayer, extent[0])
            }
            layer.activeLayerType = 'mapboxLayers'
          }
        }
      })
    },
    updateVideoLayerTime(layer, time) {
      // compute time fraction
      time = moment(time)
      let begin = moment(layer.source.dateBegin)
      let end = moment(layer.source.dateEnd)
      let durationTotal = moment.duration(end.diff(begin)).asDays()
      let durationCurrent = moment.duration(time.diff(begin)).asDays()
      let fraction = durationCurrent / durationTotal
      let t = layer.source.durationSec * fraction

      t = Math.max(0, t)
      t = Math.min(layer.source.durationSec, t)

      let player = this.map.getSource(layer.id).player
      player.setCurrentTime(t)
    },
    updateImageLayer(layer, extent) {
      const imageLayers = layer.imageLayers[0]

      // If existing gee layer on already has the correct dates and dataset, return
      if (layer.imageLayers.length > 0 && imageLayers.extent == extent) {
        return
      }

      var mapId = `${layer.dataset}_${extent.join('_')}`
      var mapJson = {
        id: mapId,
        type: 'raster',
        extent: extent,
        source: {
          type: 'raster',
          tiles: [],
          tileSize: 256
        }
      }

      if (imageLayers && imageLayers.extent) {
        const oldMapId = `${layer.dataset}_${imageLayers.extent.join('_')}`
        if (this.map.getSource(oldMapId)) {
          this.map.removeLayer(oldMapId)
          this.map.removeSource(oldMapId)
        }
      }

      const region = this.getRegion()
      var json_body = {
        dateBegin: extent[0],
        dateEnd: extent[1],
        region: region,
        vis: layer.vis
      }

      if (this.map.getSource(mapId)) {
        this.map.removeLayer(mapId)
        this.map.removeSource(mapId)
      }
      fetch(`${this.$store.state.SERVER_URL}/map/${layer.dataset}/`, {
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
          mapJson.source['tiles'] = [mapUrl['url']]
          this.map.addLayer(mapJson)
          layer.imageLayers[0] = mapJson
        })
    },
    fetchDates() {
      const region = this.getRegion()
      const body = JSON.stringify({
        region: region
      })
      this.timesliderLayers.map(layer => {
        if (!layer.active) return
        fetch(
          `${this.$store.state.SERVER_URL}/map/${layer.dataset}/times/${
            this.timeMode.timing
          }`,
          {
            method: 'POST',
            body: body,
            mode: 'cors',
            headers: {
              'Content-type': 'application/json'
            }
          }
        )
          .then(res => {
            return res.json()
          })
          .then(dates => {
            layer.dates = dates
            const layers = this.layers.map(l => {
              if (l.name === layer.name) {
                return layer
              } else {
                return l
              }
            })
            this.$emit('update:layers', layers)
          })
      })
    },
    getRegion() {
      var N = this.map.getBounds().getNorth()
      var E = this.map.getBounds().getEast()
      var S = this.map.getBounds().getSouth()
      var W = this.map.getBounds().getWest()
      return {
        type: 'Polygon',
        geodesic: true,
        coordinates: [[[W, N], [W, S], [E, S], [E, N], [W, N]]]
      }
    }
  },
  components: {
    TimeSlider
  }
}
</script>

<style>
.map {
  width: 100%;
  height: 100%;
}

.t-slider {
  position: absolute;
  bottom: 0px;
  /* right: 90vw; */
  margin: 20px;
  z-index: 2;
}

.t-slider#big-slider {
  left: 50px;
  width: calc(100% - 90px);
}
.t-slider#small-slider {
  left: 400px;
  width: calc(100% - 440px);
}
</style>
