import {
  bus
} from '@/event-bus.js';

var SERVER_URL = 'http://vegetatie-monitor.appspot.com'

function getGeeImage(map, dataset, date, sourceId, vis) {
  console.log('yay')
  var maplayer_json = {
    id: dataset + '_' + date,
    type: "raster",
    date: date,
    source: {
      type: "raster",
      tiles: [],
      tileSize: 256
    }
  }
  fetch(SERVER_URL + '/image/?id=' + sourceId, {
      method: "POST",
      body: JSON.stringify(vis),
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((res) => {
      return res.json();
    })
    .then((mapUrl) => {
      maplayer_json.source['tiles'] = [mapUrl]
      map.addLayer(maplayer_json)
      bus.$emit('add-data-layer', {dataset: dataset, layer: maplayer_json})
    })
}
export {
  getGeeImage
}
