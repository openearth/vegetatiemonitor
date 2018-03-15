import {
  bus
} from '@/event-bus.js';

var SERVER_URL = 'http://vegetatie-monitor.appspot.com'

function getGeeComposite(map, dataset, dateBegin, dateEnd, region, vis) {
  var maplayer_json = {
    id: dataset + '_composite',
    type: "raster",
    date: 'composite',
    source: {
      type: "raster",
      tiles: [],
      tileSize: 256
    }
  }

  fetch(SERVER_URL + '/map/' + dataset + '/', {
      method: "POST",
      body: JSON.stringify({
        "dateBegin": dateBegin,
        "dateEnd": dateEnd,
        "region": region,
        "vis": vis
      }),
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((res) => {
      return res.json();
    })
    .then((mapUrl) => {
      maplayer_json.source['tiles'] = [mapUrl['url']]
      map.addLayer(maplayer_json)
      bus.$emit('add-data-layer', {
        dataset: dataset,
        layer: maplayer_json
      })
    })
}

function getGeeImage(map, dataset, date, sourceId, vis) {
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
      bus.$emit('add-data-layer', {
        dataset: dataset,
        layer: maplayer_json
      })
    })
}
export {
  getGeeImage,
  getGeeComposite
}
