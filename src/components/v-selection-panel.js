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
      console.log('map loaded')
      this.changeDates()
      this.changeModus(this.beginDate, this.endDate)
    })

    bus.$on('change-false-color', (name) => {
      bus.$emit('firstImage-changed', ('composite'))
      this.changeModus(this.beginDate, this.endDate, ['satellite'])
    })
  },
  watch: {
    beginDate: {
      handler: function(beginDate) {
        this.beginDate = beginDate
      },
      deep: true
    },
    endDate: {
      handler: function(endDate) {
        this.endDate = endDate
      },
      deep: true
    },
    beginMenu: {
      handler: function(beginMenu) {
        if(beginMenu === false){
          this.changeDates()
          bus.$emit('firstImage-changed', ('composite'))
          this.changeModus(this.beginDate, this.endDate, ["satellite", "ndvi"])
        }
      },
      deep: true
    },
    endMenu: {
      handler: function(endMenu) {
        if(endMenu === false){
          this.changeDates()
          bus.$emit('firstImage-changed', ('composite'))
          this.changeModus(this.beginDate, this.endDate, ["satellite", "ndvi"])
        }
      },
      deep: true
    },
    radioButtons: {
      handler: function(radioButtons) {
        if(this.radioButtons === 'radio-composite') {
          bus.$emit('firstImage-changed', ('composite'))
          this.changeModus(this.beginDate, this.endDate, ["satellite", "ndvi"])
        } else {
          bus.$emit('firstImage-changed', (this.firstImage))
          this.changeModus(this.firstImage, null, ["satellite", "ndvi"])
        }

      },
      deep: true
    },
    firstImage: {
      handler: function(firstImage) {
        bus.$emit('firstImage-changed', (this.firstImage))
        this.changeModus(this.firstImage, null, ["satellite", "ndvi"])
      },
      deep: true
    }
  },
  methods: {
    changeModus(begindate, enddate, modes = datasets) {
        _.each(modes, (dataset) => {
          bus.$emit('remove-data-layer', ({
            'dataset': dataset
          }))

          var menulayer = _.find(this.layers, {
            'dataset': dataset
          })
          var vis = menulayer.vis
          this.region = region
          if ((dataset === 'landuse' || dataset === 'landuse-vs-legger') && (this.map.getZoom() > 10)) {
            var N = this.map.getBounds().getNorth()
            var E = this.map.getBounds().getEast()
            var S = this.map.getBounds().getSouth()
            var W = this.map.getBounds().getWest()
            this.region = {'type': 'Polygon',
            'coordinates': [[[W, N], [W, S], [E, S], [E, N], [W, N]]]}
            console.log('changemodus landuse or dataset',  dataset, begindate, this.region, vis, enddate)
            getGeeComposite(this.map, dataset, begindate, this.region, vis, enddate)
          } else if (dataset != 'landuse' && dataset != 'landuse-vs-legger') {
            console.log('changemodus satellite or ndvi',  dataset, begindate, this.region, vis, enddate)
            getGeeComposite(this.map, dataset, begindate, this.region, vis, enddate)
          }
        })

    },
    changeFirstImageDate(modes = datasets) {
      console.log('change firsr image date', modes, this.firstImage)
      bus.$emit('firstImage-changed', (this.firstImage))
      _.each(modes, (dataset) => {
        var menulayer = _.find(this.layers, 'dataset', dataset)
        var checkDate = _.find(menulayer.data, {
          'date': this.firstImage
        })
        console.log(checkDate)
        if (checkDate == undefined) {
          var menulayer = _.find(this.layers, {
            'dataset': dataset
          })
          var vis = menulayer.vis
          this.region = region
          console.log('checking')
          if ((dataset === 'landuse' || dataset === 'landuse-vs-legger') && (this.map.getZoom() > 10)) {
            var N = this.map.getBounds().getNorth()
            var E = this.map.getBounds().getEast()
            var S = this.map.getBounds().getSouth()
            var W = this.map.getBounds().getWest()
            this.region = {'type': 'Polygon',
            'coordinates': [[[W, N], [W, S], [E, S], [E, N], [W, N]]]}
            console.log('landuse thingie')
            getGeeComposite(this.map, dataset, this.firstImage, this.region, vis)
          } else if (dataset != 'landuse' && dataset != 'landuse-vs-legger') {
            getGeeComposite(this.map, dataset, this.firstImage, this.region, vis)
          }
        }
      })
    },
    changeDates() {
      // TODO: change coordinates using this.map.getBounds()['_ne']['lat'] etc...
      var json_data = {
        "dateBegin": this.beginDate,
        "dateEnd": this.endDate,
        "region": region,
      }

      console.log('change Dates', SERVER_URL + '/map/satellite/times/', JSON.stringify(json_data))
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
      if(this.map === null) {
        return true
      } else {
        return this.map.getZoom() < 10
      }
    },
    classify(modes) {
      if(this.radioButtons === 'radio-composite') {
        bus.$emit('firstImage-changed', ('composite'))
        this.changeModus(this.beginDate, this.endDate, modes)
      } else {
        bus.$emit('firstImage-changed', (this.firstImage))
        this.changeModus(this.firstImage, null, modes)
      }
    }
  },
  components: {}
};
