import {
  bus
} from '@/event-bus.js';

var SERVER_URL = 'http://vegetatie-monitor.appspot.com'

function getGeeComposite(map, dataset, dateBegin, region, vis, dateEnd = null) {
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
  var json_body = {
    "dateBegin": dateBegin,
    "region": region,
    "vis": vis
  }
  if (dateEnd) {
    json_body['dateEnd'] = dateEnd
  }
  fetch(SERVER_URL + '/map/' + dataset + '/', {
      method: "POST",
      body: JSON.stringify(json_body),
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

export {
  getGeeComposite
}
