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
      beginDate: "2016-07-20",
      endDate: "2016-07-21",
      beginMenu: false,
      endMenu: false,
      firstImage: null,
      secondImage: null,
      imageMode: false,
      Image1: [],
      Image2: [],
      firstImages: {},
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
          var menulayer = _.find(this.layers, {
            'dataset': dataset
          })
          var vis = menulayer.vis
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
    }
  },
  components: {}
};
