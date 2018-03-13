import {
  bus
} from '@/event-bus.js';

function getGeeSource(map, maplayer, dateBegin, dateEnd, vis) {
  var lat_max = map.getBounds()['_ne']['lat']
  var lon_max = map.getBounds()['_ne']['lng']
  var lat_min = map.getBounds()['_sw']['lat']
  var lon_min = map.getBounds()['_sw']['lng']
  var json_data = {
    dateBegin: dateBegin,
    dateEnd: dateEnd,
    vis: vis,
    region: {
      "geodesic": true,
      "type": "Polygon",
      "coordinates": [
        [
          [lon_min, lat_max],
          [lon_min, lat_min],
          [lon_max, lat_min],
          [lon_max, lat_max],
          [lon_min, lat_max]
        ]
      ]
    }
  }
  getTileUrl(map, json_data, maplayer)
}

function getTileUrl(map, json_data, maplayer) {
  // Send post request to server and retrieve a URL to tiled layer
  var SERVER_URL = 'http://vegetatie-monitor.appspot.com'
  var mapUrl = fetch(SERVER_URL + '/map/' + maplayer.data[0].id + '/', {
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
      maplayer.data[0].source['tiles'] = [mapUrl['url']]
      map.addLayer(maplayer.data[0])
      bus.$emit('add-layer', (maplayer))
    })
}

export {
  getGeeSource
}
