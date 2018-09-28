import {
  bus
} from '@/event-bus.js';
import moment from 'moment';

var SERVER_URL = 'https://vegetatie-monitor.appspot.com'

// Function to send out a post request and receive images and add them to the map
function getGeeComposite(map, dataset, dateBegin, region, vis, dateEnd = null) {
  var map_id = dataset + '_' + dateBegin
  if (map.getSource(map_id)) {
    map.removeLayer(map_id)
    map.removeSource(map_id)
  } else {
  var maplayer_json = {
    id: map_id,
    type: "raster",
    date: dateBegin,
    source: {
      type: "raster",
      tiles: [],
      tileSize: 256
    }
  }

  var json_body = {
    "dateBegin": moment(dateBegin).format('YYYY-MM-DD'),
    "dateEnd": moment(dateBegin).add(1, 'd').format('YYYY-MM-DD'),
    "region": region,
    "vis": vis
  }
  if (dateEnd) {
    json_body['dateEnd'] = dateEnd
    maplayer_json['id'] = dataset + '_composite'
    maplayer_json['date'] = 'composite'
  }
  console.log('getGeeComposite', SERVER_URL + '/map/' + dataset + '/', JSON.stringify(json_body))
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
}

export {
  getGeeComposite
}
