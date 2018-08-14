import _ from 'lodash';
import draggable from 'vuedraggable'
import {
  bus
} from '@/event-bus.js';
import {
  getGeeComposite
} from './get-gee-layers.js'
import moment from 'moment';

var SERVER_URL = 'https://vegetatie-monitor.appspot.com'

// TODO: Fix this by looping over datasets in this.layers. This is an ugly fix
var datasets = ["satellite", "ndvi", "landuse", "landuse-vs-legger"]
var region = {
  "coordinates": [
    [
      [
        4.54,
        52.71
      ],
      [
        4.17,
        50.75
      ],
      [
        6.2,
        50.7
      ],
      [
        6.44,
        52.68
      ],
      [
        4.54,
        52.71
      ]
    ]
    ],
  "geodesic": true,
  "type": "Polygon"
}


export default {
  name: 'v-selection-panel',
  props: {
    layers: {
      type: Array,
      required: true
    },
    map: {
      type: Object
    },
    selection: {
      type: Object
    }
  },
  data() {
    return {
      beginDate: "2018-07-25",
      endDate: "2018-07-28",
      beginMenu: false,
      endMenu: false,
      firstImage: null,
      secondImage: null,
      imageMode: false,
      Image1: [],
      Image2: [],
      firstImages: {},
      region: {},
      radioButtons: "radio-composite"
    }
  },
  mounted() {
    this.emitSelection()
    if (this.selection) {
      // input properties
      this.beginDate = this.selection.beginDate
      this.endDate = this.selection.endDate
      this.firstImage = this.selection.firstImage
      this.secondImage = this.selection.secondImage
    }
    bus.$on('map-loaded', (event) => {
      this.changeModus()
      this.changeDates()
    })

    bus.$on('change-false-color', (name) => {
      this.changeModus(['satellite'])
    })
  },
  watch: {
    beginDate: {
      handler: function(beginDate) {
        this.changeDates()
        this.changeModus()
      },
      deep: true
    },
    endDate: {
      handler: function(endDate) {
        this.changeDates()
        this.changeModus()
      },
      deep: true
    },
    radioButtons: {
      handler: function(radioButtons) {
        this.changeModus()
      },
      deep: true
    },
    firstImage: {
      handler: function(firstImage) {
        this.changeFirstImageDate()
      },
      deep: true
    }
  },
  methods: {
    changeModus(modes = datasets) {
      bus.$emit('firstImage-changed', ('composite'))
      if (this.radioButtons == "radio-composite") {
        _.each(modes, (dataset) => {
          bus.$emit('remove-data-layer', ({
            'dataset': dataset
          }))
          var menulayer = _.find(this.layers, {
            'dataset': dataset
          })
          var vis = menulayer.vis
          this.region = region
          if (dataset === 'landuse' | dataset === 'landuse-vs-legger'){
            var N = this.map.getBounds().getNorth()
            var E = this.map.getBounds().getEast()
            var S = this.map.getBounds().getSouth()
            var W = this.map.getBounds().getWest()
            this.region = {'type': 'Polygon',
            'coordinates': [[[W, N], [W, S], [E, S], [E, N], [W, N]]]}
          }
          getGeeComposite(this.map, dataset, this.beginDate, this.region, vis, this.endDate)
        })
      } else {
        // TODO: implement single/double image mode ?
      }
    },
    changeFirstImageDate() {
      bus.$emit('firstImage-changed', (this.firstImage))
      _.each(datasets, (dataset) => {
        var menulayer = _.find(this.layers, 'dataset', dataset)
        var checkDate = _.find(menulayer.data, {
          'date': this.firstImage
        })
        if (checkDate == undefined) {
          var menulayer = _.find(this.layers, {
            'dataset': dataset
          })
          var vis = menulayer.vis
          this.region = region
          if (dataset === 'landuse' | dataset === 'landuse-vs-legger'){
            var N = this.map.getBounds().getNorth()
            var E = this.map.getBounds().getEast()
            var S = this.map.getBounds().getSouth()
            var W = this.map.getBounds().getWest()
            this.region = {'type': 'Polygon',
            'coordinates': [[[W, N], [W, S], [E, S], [E, N], [W, N]]]}
          }
          getGeeComposite(this.map, dataset, this.firstImage, this.region, vis)
        }
      })
    },
    changeDates() {
      // TODO: change coordinates using this.map.getBounds()['_ne']['lat'] etc...
      var json_data = {
        "dateBegin": this.beginDate,
        "dateEnd": this.endDate,
        "region": this.region,
      }
      var mapUrl = fetch(SERVER_URL + '/map/satellite/times/', {
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
      .then((response) => {
        var imagesList = []
        _.each(response['image_times'], (image_time, i) => {
          imagesList.push(moment(response['image_times'][i]).format('YYYY-MM-DD'))
          this.firstImages[image_time] = response['image_ids'][i]
        })
        this.Image1 = imagesList
        this.Image2 = imagesList
      })
      this.emitSelection()
    },
    emitSelection() {
      this.selection.beginDate = this.beginDate
      this.selection.endDate = this.endDate
      bus.$emit('selection-changed', (this.selection))
    },

    checkClassificationButton(){
      console.log(this.map)
      if(this.map === null) {
        return true
      } else {
        console.log(this.map.getZoom() < 10)
        return this.map.getZoom() < 10
      }
    }
  },
  components: {}
};
