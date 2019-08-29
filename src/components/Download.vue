<template>
  <div id="download">
    <h1 class="pa-4">
      Download
    </h1>
    <v-layout column fill-height justify-start>
      <v-card small flat>
        <v-card-text class="py-0 carddiv">
          <v-card flat>
            <v-layout
              id="cardlayout"
              align-center
              justify-space-end
              fill-height
              v-for="layer in dataLayers"
              :key="layer.name"
            >
              <v-flex xs1>
                <v-checkbox
                  id="checkbox"
                  :key="layer.name"
                  v-model="layer.active"
                />
              </v-flex>
              <v-flex xs2>
                <v-img
                  contain
                  max-height="100%"
                  class="ma-1"
                  :src="layer.icon"
                />
              </v-flex>
              <v-flex xs7>
                {{ layer.name }}
              </v-flex>
            </v-layout>
          </v-card>
        </v-card-text>
      </v-card>
      <v-flex shrink>
        <h1 class="pa-4">
          Settings
        </h1>
        <v-card small flat class="py">
          <v-card-text>
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  dense
                  v-model="resolution"
                  label="Resolutie"
                  clearable
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  dense
                  v-model="bbox"
                  label="Selecteer gebied"
                  clearable
                  append-icon="fa-draw-polygon"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex shrink>
        <v-layout justify-center align-start>
          <v-btn outlined color="btncolor" @click="downloadGeotiff()">
            download
          </v-btn>
        </v-layout>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
  props: {
    map: {
      type: Object,
      required: true
    },
    layers: {
      type: Array,
      required: true
    },
    dateBegin: {
      type: String
    },
    dateEnd: {
      type: String
    }
  },
  computed: {
    dataLayers: {
      get() {
        return this.layers
      }
    }
  },
  data() {
    return {
      resolution: 100,
      bbox: ''
    }
  },
  components: {},

  methods: {
    downloadGeotiff() {
      var selectedLayers = this.dataLayers.filter(x => x.active)
      selectedLayers.forEach(layer => {
        if (this.bbox === '') {
          var N = this.map.getBounds().getNorth()
          var E = this.map.getBounds().getEast()
          var S = this.map.getBounds().getSouth()
          var W = this.map.getBounds().getWest()
          var bbox = {
            type: 'Polygon',
            coordinates: [[[W, N], [W, S], [E, S], [E, N], [W, N]]]
          }
        } else {
          bbox = this.bbox
        }

        var json_body = {
          region: bbox,
          dateBegin: this.dateBegin,
          dateEnd: this.dateEnd,
          vis: layer.vis,
          scale: this.resolution
        }
        fetch(`${this.$store.state.SERVER_URL}/map/${layer.dataset}/export/`, {
          method: 'POST',
          body: JSON.stringify(json_body),
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(res => {
            return res.json()
          })
          .then(mapUrl => {
            window.open(mapUrl['url'])
          })
      })
    }
  }
}
</script>

<style scoped>
#checkbox {
  height: 100%;
  margin: auto;
}

.carddiv {
  max-height: 40vh;
  overflow-y: auto;
}
#cardlayout {
  width: 100%;
  height: 48px;
}

#download {
  max-height: 100%;
}
</style>
