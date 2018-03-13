import {
  bus
} from '@/event-bus.js';

export default {
  name: 'v-satellite-images',
  data() {
    return {
      map: null,
      dateBegin: "2016-07-20",
      dateEnd: "2016-07-21",
      vis: { 
        bands: ["red", "green", "blue"],
        gamma: 2.0
      }
    }
  },

  mounted() {},
  methods: {

    deferredMountedTo(map) {
      this.map = map
      var lat_max = map.getBounds()['_ne']['lat']
      var lon_max = map.getBounds()['_ne']['lng']
      var lat_min = map.getBounds()['_sw']['lat']
      var lon_min = map.getBounds()['_sw']['lng']
      var json_data = {
        dateBegin: this.dateBegin,
        dateEnd: this.dateEnd,
        vis: {
          bands: this.bands
        },
        region: {
          "geodesic": true,
          "type": "Polygon",
          "coordinates": [
            [
              [lon_min, lat_max],
              [lon_max, lat_max],
              [lon_max, lat_min],
              [lon_min, lat_min],
              [lon_min, lat_max]
            ]
          ]
        }
      }
      this.getTileUrl(json_data)
    },

    getTileUrl(json_data) {
      // Send post request to server and retrieve a URL to tiled layer
      var SERVER_URL = 'http://vegetatie-monitor.appspot.com'
      var image_urls = fetch(SERVER_URL + '/map/satellite/', {
          method: "POST",
          body: JSON.stringify(json_data),
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then((res) => {
          return res.json();
        })
        .then((mapUrl) => {
          this.updateLayers(mapUrl)
        })
    },
    updateLayers(mapUrl) {
      // Update this.layers and mapbox layers with new satllite layers
      var layer_json = {
        id: 'satellite',
        name: 'Satelliet beelden',
        icon: 'satellite',
        active: 'true',
        type: "raster",
        layout: {
          visibility: "none"
        },
        source: {
          type: "raster",
          tiles: [mapUrl['url']],
          tileSize: 256
        }
      }
      this.map.addLayer(layer_json);
      bus.$emit('add-layer', layer_json);
    }
  }
}
