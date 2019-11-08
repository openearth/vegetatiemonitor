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
        @update:time-mode="$emit('update:time-mode', $event)"
        @update:timeslider="updateTimeslider($event)"
        @update:step="updateStep($event, 'nearest')"
        @move-step-backward="updateStep($event, 'backward')"
        @move-step-forward="updateStep($event, 'forward')"
      >
      </time-slider>
    </v-card>
  </div>
</template>

<script>
import TimeSlider from './TimeSlider'
import moment from 'moment'
import { degreesToTiles, range, fetchAndControl, getUrlParam, getMapRegion } from '../utils'
import _ from 'lodash'

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
    },
    loadingLayers: {
      type: Array
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
  watch: {
    timeMode: {
      handler() {
        this.fetchDates(true)
      }
    },
    layers: {
      handler() {
        this.updateTimedLayers([this.dateBegin, this.dateEnd])
      }
    },
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

      this.fetchDates(true)

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
    updateStep(step, place) {
      step = step.format("YYYY-MM-DD")
      if (this.timeMode.timing === 'daily') {
        const dates = this.dates.map(t => t.date)
        if (dates.includes(step) && place === 'nearest') {
          // don't snap to next/previous, use date itself
          this.step = moment(step)
        } else {
          let diff = 365
          if(place === 'backward') {
            diff = -365
          }
          // snap to nearest, or when place is filled
          let ind = dates.length - 1
          // Find the nearest available date
          dates.forEach((d, i) => {
            const localDiff = moment(d).diff( moment(step), 'days')
            if(place === 'nearest') {
              // Find the actual date that is nearest to the given date
              if(Math.abs(localDiff) < diff) {
                diff = Math.abs(localDiff)
                ind = i
              }
            } else if (place === 'backward'){
              // Find the element that is closest before the date
              if(localDiff < 0 && localDiff > diff ) {
                diff = localDiff
                ind = i
              }
            } else if (place === 'forward'){
              // Find the element that is closest after the date
              if(localDiff > 0 && localDiff < diff ) {
                diff = localDiff
                ind = i
              }
            }
          })
          this.step = moment(dates[ind])
        }
      } else if (this.timeMode.timing === 'yearly') {
        const newStep = moment(step).startOf('year').format("YYYY-MM-DD")
        if(this.cachedYearlyDates) {
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
    onClassify() {
      console.log('on classify')
    },
    onClassifyClear() {
      console.log('on classify clear')
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
      if (!time){
        time = moment()
      }
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
      if(this.map.getSource(layer.id)){
        let player = this.map.getSource(layer.id).player
        player.setCurrentTime(t)
      }
    },
    updateImageLayer(layer, extent) {
      // do not update if we have custom layer and it does not need to refresh (e.g. daily classification)
      if(layer.customExtent && !layer.needsUpdate && this.timeMode.name === 'DAG') {
          return
      }

      const imageLayers = layer.imageLayers[0]
      var mapId = `${layer.dataset}_${extent.join('_')}`

      // Remove old layer from map
      if (imageLayers && imageLayers.extent) {
        const oldMapId = `${layer.dataset}_${imageLayers.extent.join('_')}`

        // If existing gee layer on already has the correct dates and dataset, return
        if (layer.imageLayers.length > 0 && oldMapId === mapId && !layer.customExtent) {
          return
        }
        if (this.map.getSource(oldMapId)) {
          this.map.removeLayer(oldMapId)
          this.map.removeSource(oldMapId)
        }
      }

      if(layer.needsUpdate) {
        layer.needsUpdate = false
      }

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

      let region = getMapRegion(this.map)

      // override classifcation region for the cases when map layers are initialized lazily
      if(layer.customExtent) {
        region = layer.classificationRegion
      }
      
      var jsonBody = {
        dateBegin: extent[0],
        dateEnd: extent[1],
        region: region,
        vis: layer.vis
      }

      let promise = fetchAndControl(`${this.$store.state.SERVER_URL}/map/${layer.dataset}/`, {
        method: 'POST',
        body: JSON.stringify(jsonBody),
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      let promises = [...this.loadingLayers]

      // Remove old promises before creating a new promise with the same name
      const oldReqs = promises.filter(p => p.name === layer.name)
      oldReqs.forEach(p => p.controller.abort())

      // store the name of the layer in the promise
      promise.name = layer.name
      // add the promise to the  list of loading Layers
      promises.push(promise)
      // sync
      this.$emit('update:loadingLayers', promises)

      promise
        .then(res => {
          return res.json()
        })
        .then(mapUrl => {
          if('accuracy' in mapUrl) {
            let accuracyText = 'Training accurracy is: ' + Math.floor(parseFloat(mapUrl['accuracy']) * 100) + '%'
            layer.classificationMessage = accuracyText + '\nDate: ' + extent[0] + ''
          }
          mapJson.source['tiles'] = [mapUrl['url']]
          // If mapId already exists, remove from map
          if (this.map.getSource(mapId)) {
            this.map.removeLayer(mapId)
            this.map.removeSource(mapId)
          }
          this.map.addLayer(mapJson)
          layer.imageLayers[0] = mapJson
          // remove the promise from the list
          let promises = [...this.loadingLayers]
          _.pull(promises, promise)
          // sync
          this.$emit('update:loadingLayers', promises)
        })
        .catch(() => {
          // remove  the promise from the list
          let promises = [...this.loadingLayers]
          _.pull(promises, promise)
          // sync
          this.$emit('update:loadingLayers', promises)
      })
    },
    fetchDates(updateStep) {
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

        let region = getMapRegion(this.map)
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
          if(updateStep) {
            this.updateStep(this.step, 'nearest')
          }
        })
      }
    },
    getTiles() {
      let region = getMapRegion(this.map)

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
