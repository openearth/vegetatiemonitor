import _ from 'lodash';
import draggable from 'vuedraggable'
import {
  bus
} from '@/event-bus.js';

var SERVER_URL = 'http://vegetatie-monitor.appspot.com'

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
      firstImages: {}
    };
  },
  mounted() {
    this.changeDates()
  },
  watch: {
    beginDate: {
      handler: function(beginDate) {
        this.changeDates()
      },
      deep: true
    },
    endDate: {
      handler: function(endDate) {
        this.changeDates()
      },
      deep: true
    },
    firstImage: {
      handler: function(firstImage) {
        console.log(this.firstImage)
        console.log(this.firstImages[this.firstImage])
        // TODO: add new layer to the map
        // this.layers
        // getGeeSource(this.map, maplayer, this.beginDate, endDate, vis)
      },
      deep: true
    }
  },
  methods: {
    changeDates() {
      var json_data = {
        "dateBegin": this.beginDate,
        "dateEnd": this.endDate,
        "region": {
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
        "vis": {
          "bands": [
            "red",
            "green",
            "blue"
          ],
          "gamma": 2
        }
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
            console.log(image_time, i)
            this.firstImages[image_time] = response['image_ids'][i]
          } )
          console.log(this.firstImages)
        })


    }
  },
  components: {}
};
