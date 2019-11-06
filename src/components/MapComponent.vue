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
        :timeModes="timeModes"
        :dates="dates"
        :step.sync="step"
        @update-time-mode="updateTimeMode($event)"
        @update-timeslider="updateTimeslider($event)"
        @update:step="updateStep($event)"
      >
      </time-slider>
    </v-card>
  </div>
</template>

<script>
import TimeSlider from './TimeSlider'
import moment from 'moment'
import { degreesToTiles, range } from '../utils'

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
      scale: 10,
      dates: [],
      step: moment().subtract(1, 'year').startOf('year')
    }
  },
  computed: {
    timeModes() {
      const currentMode = this.modes.find(mode => mode.name === this.$route.name)
      return currentMode.timeModes
    },
    timesliderLayers() {
      if (!this.layers) return
      return this.layers.filter(layer => layer.timeslider && layer.active)
    }
  },
  mounted() {
    this.map = this.$refs.map.map

    this.map.on('load', () => {

      // disable map rotation using right click + drag
      this.map.dragRotate.disable()

      // disable map rotation using touch rotation gesture
      this.map.touchZoomRotate.disableRotation()
      this.$emit('update:map', this.map)
      this.addMapboxLayers()

      this.fetchDates()

      const event = {
        beginDate: this.step[0],
        endDate: this.step[1]
      }
      this.updateTimedLayers(event)

      this.map.on('zoomend', this.fetchDates)
      this.map.on('dragend', this.fetchDates)
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
    updateTimeMode(timeMode){
      this.$emit('update:time-mode', timeMode)
      this.fetchDates()
    },
    updateStep(step) {
      step = step.format("YYYY-MM-DD")
      if (this.timeMode.timing === 'daily') {
        const dates = this.dates.map(t => t.date)
        if (dates.length === 0){
          return
        } else if (dates.includes(step)) {
          this.step = moment(step)
          return
        } else {
          let diff = 365
          let ind = dates.length - 1
          // Find the nearest available date
          dates.forEach((d, i) => {
            const localDiff = Math.abs(moment(d).diff( moment(step), 'days'))
            if(localDiff < diff) {
              diff = localDiff
              ind = i
            }
          })
          this.step = moment(dates[ind])
        }
      } else if (this.timeMode.timing === 'yearly') {
        const newStep = moment(step).startOf('year').format("YYYY-MM-DD")
        if(!this.cachedYearlyDates) {
          return
        } else {
          const dates = this.cachedYearlyDates.map(t => t.dateStart)
          if (dates.includes(newStep)) {
            this.step = moment(newStep)
          } else {
            this.step = moment(dates[dates.length - 1])
          }
        }
      }
    },
    updateTimeslider(event) {
      const extent = [
        event.beginDate,
        event.endDate
      ]
      this.$emit('update:dateBegin', extent[0])
      this.$emit('update:dateEnd', extent[1])

      this.timing = event.timing
      this.dragging = event.dragging
      if(this.map) {
        this.updateTimedLayers(extent)
      }
    },
    addMapboxLayers() {
      this.layers.forEach(layer => {
        layer.mapboxLayers.forEach(maplayer => {
          if (!maplayer.id) return
          if (!this.map.getSource(maplayer.id)) {
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
          if (this.timing === 'DAG' && this.dragging === false && this.map.getZoom() >= 9) {
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

      // Remove old layer from map
      if (imageLayers && imageLayers.extent) {
        const oldMapId = `${layer.dataset}_${imageLayers.extent.join('_')}`
        if (this.map.getSource(oldMapId)) {
          this.map.removeLayer(oldMapId)
          this.map.removeSource(oldMapId)
        }
      }

      const region = this.getRegion()
      var jsonBody = {
        dateBegin: extent[0],
        dateEnd: extent[1],
        region: region,
        vis: layer.vis
      }

      // If mapId already exists, remove from map
      if (this.map.getSource(mapId)) {
        this.map.removeLayer(mapId)
        this.map.removeSource(mapId)
      }
      this.$emit('loading-layer', layer.name)
      fetch(`${this.$store.state.SERVER_URL}/map/${layer.dataset}/`, {
        method: 'POST',
        body: JSON.stringify(jsonBody),
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
        this.$emit('done-loading-layer', layer.name)
      })
      .catch(() => {
        this.$emit('done-loading-layer', layer.name)
      })
    },
    fetchDates() {
      // After each interaction with the map, fetch the new dates belonging to
      // the timed layers
      const layer = this.layers.filter(layer => layer.name === 'Satelliet beelden')
      if (!this.map) {
        return
      }
      // If not zoomed in enough, do nothing
      if (this.map.getZoom() < 9) {
        this.dates = []
      } else {
        // avoid fetching yearly dates, take them from cache
        if(this.timeMode.timing === 'yearly' && this.cachedYearlyDates) {
          this.dates = this.cachedYearlyDates
          return
        }

        let region = this.getRegion()
        let body = JSON.stringify({ region: region })

        let url = `${this.$store.state.SERVER_URL}/map/${layer[0].dataset}/times/${this.timeMode.timing}`

        // ... testing querying times by tiles
        if(this.timeMode.timing === 'daily') {
          url = `${this.$store.state.SERVER_URL}/get_times_by_tiles/`
          body = JSON.stringify(this.getTiles())
        }

        fetch(url, {
            method: 'POST',
            body: body,
            mode: 'cors',
            headers: {
              'Content-type': 'application/json'
            }
          }
        )
        .then(res => res.json())
        .then(dates => {
          // cache yearly dates
          if(this.timeMode.timing === 'yearly') {
            this.cachedYearlyDates = dates
          }
          this.dates = dates
        })

        this.updateStep(this.step)
      }
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
    },
    getTiles() {
      let region = this.getRegion()

      let zoom = 10
      let tilesMax = degreesToTiles(region.coordinates[0][1][0], region.coordinates[0][1][1], zoom)
      let tilesMin = degreesToTiles(region.coordinates[0][3][0], region.coordinates[0][3][1], zoom)

      return {
        tilesMin: { tx: tilesMax[0], ty: tilesMin[1] },
        tilesMax: { tx: tilesMin[0], ty: tilesMax[1] }
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
