<template>
  <div id="download">
    <v-layout column fill-height>
      <v-flex xs4 align-stretch>
        <h1 class="pa-4">
          Download
        </h1>
        <v-layout
          id="cardlayout"
          align-center
          justify-space-end
          fill-height
          v-for="layer in dataLayers"
          :key="layer.name"
        >
          <v-flex xs1>
            <v-checkbox :key="layer.name" v-model="layer.active"></v-checkbox>
          </v-flex>
          <v-flex xs2>
            <v-img contain max-height="100%" class="ma-1" :src="layer.icon" />
          </v-flex>
          <v-flex xs7>
            {{ layer.name }}
          </v-flex>
        </v-layout>
      </v-flex>
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
                <p>Geselecteerd gebied: {{ bbox }}</p>
              </v-flex>
              <v-flex>
                <v-layout justify-center align-start>
                  <v-btn outlined color="btncolor" @click="getBbox()">
                    Polygoon van huidig beeld
                  </v-btn>
                </v-layout>
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
import MapboxDraw from '@mapbox/mapbox-gl-draw'

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
      bbox: '',
      draw: {}
    }
  },
  components: {},
  mounted() {
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    })
    this.map.addControl(this.draw, 'top-right')

    this.map.on('draw.create', () => {
      if (this.draw.getAll().features.length > 1) {
        const oldId = this.draw.getAll().features[0].id
        this.draw.delete(oldId)
      }
      this.bbox = this.draw.getAll().features[0].geometry
    })

    this.map.on('draw.update', () => {
      this.bbox = this.draw.getAll().features[0].geometry
    })
  },
  beforeDestroy() {
    this.map.removeControl(this.draw)
  },
  methods: {
    getBbox() {
      var N = this.map.getBounds().getNorth()
      var E = this.map.getBounds().getEast()
      var S = this.map.getBounds().getSouth()
      var W = this.map.getBounds().getWest()
      this.bbox = {
        type: 'Polygon',
        coordinates: [[[W, N], [W, S], [E, S], [E, N], [W, N]]]
      }
    },
    downloadGeotiff() {
      var selectedLayers = this.dataLayers.filter(x => x.active)
      selectedLayers.forEach(layer => {
        if (this.bbox === '') {
          this.getBbox()
        }
        var json_body = {
          region: this.bbox,
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
  height: 100%;
  width: 100%;
}
</style>
