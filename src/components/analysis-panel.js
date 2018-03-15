import _ from 'lodash';
import draggable from 'vuedraggable'
import {
  bus
} from '@/event-bus.js';
import {
  getGeeImage,
  getGeeComposite
} from './get-gee-layers.js'

var SERVER_URL = 'http://vegetatie-monitor.appspot.com'
var datasets = ["satellite"]

export default {
  name: 'layer-control',
  props: {
    layers: {
      type: Array,
      required: true
    },
    map: {
      type: Object
    }
  },
  data() {
    return {
      beginDate: "2016-07-20",
      endDate: "2016-07-21",
      beginMenu: false,
      endMenu: false,
      modal: false,
      firstImage: null,
      secondImage: null,
      imageMode: false,
      Image1: [],
      Image2: [],
      firstImages: {},
      vis: {
        bands: ["red", "green", "blue"],
        gamma: 2.0
      },
      region: {
        "coordinates": [
          [
            [
              5.846,
              51.984
            ],
            [
              5.849,
              51.961
            ],
            [
              5.91,
              51.96
            ],
            [
              5.916,
              51.985
            ],
            [
              5.877,
              51.99
            ],
            [
              5.846,
              51.984
            ]
          ]
        ],
        "geodesic": true,
        "type": "Polygon"
      },
      radioButtons: "radio-composite"
    }
  },
  mounted() {
    bus.$on('map-loaded', (event) => {
      this.changeModus()
      this.changeDates()
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
    changeModus() {
      bus.$emit('firstImage-changed', ('composite'))
      if (this.radioButtons == "radio-composite") {
        _.each(datasets, (dataset) => {
          bus.$emit('remove-data-layer', ({
            'dataset': dataset
          }))
          getGeeComposite(this.map, dataset, this.beginDate, this.endDate, this.region, this.vis)
        })
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
          getGeeImage(this.map, dataset, this.firstImage, this.firstImages[this.firstImage], this.vis)
        }
      })
    },
    changeDates() {
      // TODO: change coordinates using this.map.getBounds()['_ne']['lat'] etc...
      var json_data = {
        "dateBegin": this.beginDate,
        "dateEnd": this.endDate,
        "region": this.region,
        "vis": this.vis
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
          this.Image1 = response['image_times']
          this.Image2 = response['image_times']
          _.each(response['image_times'], (image_time, i) => {
            this.firstImages[image_time] = response['image_ids'][i]
          })
        })
    }
  },
  components: {}
};
