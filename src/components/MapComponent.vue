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
import moment from 'moment'
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
      map: null,
      dateBegin: '01-01-2019',
      dateEnd: '01-03-2019'
    }
  },
  computed: {
    timesliderLayers() {
      return this.layers.filter(layer => layer.timeslider && layer.active)
    }
  },
  mounted() {
    this.map = this.$refs.map.map
    this.map.on('load', () => {
      this.addMapboxLayers()
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
    updateGEELayers(dataset, dateBegin, region, vis, dateEnd = null) {
      var map_id = `${dataset}_${dateBegin}`
      if (this.map.getSource(map_id)) {
        this.map.removeLayer(map_id)
        this.map.removeSource(map_id)
      } else {
        var maplayer_json = {
          id: map_id,
          type: 'raster',
          date: dateBegin,
          source: {
            type: 'raster',
            tiles: [],
            tileSize: 256
          }
        }

        var json_body = {
          dateBegin: moment(dateBegin).format('YYYY-MM-DD'),
          dateEnd: moment(dateBegin)
            .add(1, 'd')
            .format('YYYY-MM-DD'),
          region: region,
          vis: vis
        }
        if (dateEnd) {
          json_body['dateEnd'] = dateEnd
          maplayer_json['id'] = dataset + '_composite'
          maplayer_json['date'] = 'composite'
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
    toggleLayers() {
      // Function to toggle the visibility and opacity of the layers.
      var vis = ['none', 'visible']

      this.layers.forEach(layer => {
        layer.data.each(sublayer => {
          if (layer.active) {
            if (layer.layertype === 'gee-layer') {
              this.updateGEELayers(
                layer.dataset,
                this.dateBegin,
                this.region,
                layer.vis,
                this.dateEnd
              )
            }
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
