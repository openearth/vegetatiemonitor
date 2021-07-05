<template>
  <div class="download">
    <v-layout column fill-height>
      <v-flex xs4 align-stretch>
        <h1 class="pa-4">
          Download
        </h1>
        <v-layout
          class="cardlayout pa-4"
          align-center
          justify-space-end
          fill-height
          v-for="layer in layers"
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
          Tijdselectie
        </h1>
        <p class="px-4">{{timeSelectionText}}</p>
      </v-flex>
      <v-flex grow>
        <div class="pa-4">
          <v-alert outlined type="info" v-if="!downloading && map.getZoom() > 9">
            <p>
              Voor Download:
              Selecteer de lagen om te downloaden onder het kopje download.
              Selecteer de tijd met behulp van de tijdslider.
              Om een polygoon te tekenen, gebruik de tekenknoppen rechts op de kaart.
              Download vervolgens met een van de knoppen hier onder.
            </p>
          </v-alert>
          <v-alert outlined type="info" v-if="bbox.coordinates">
            Een polygoon is geselecteerd en kan gedownload worden!
          </v-alert>
          <v-alert outlined type="info" v-if="downloading">
            {{downloadText}}
          </v-alert>
          <v-alert outlined type="warning" v-if="map.getZoom() < 11">
            Zoom in op de kaart om het te downloaden gebied te verkleinen.
          </v-alert>
          <v-alert outlined type="error" v-if="error != ''">
            {{error}}
          </v-alert>
        </div>
      </v-flex>
      <v-flex shrink>
        <div class="pa-4">
          <v-btn
            class="mb-1"
            :disabled="downloading || map.getZoom() < 11"
            block
            outlined
            color="btncolor"
            @click="downloadCurrentView()"
          >
            Download huidige viewerbeeld
          </v-btn>
          <v-btn
            class="mb-1"
            :disabled="downloading || !bbox.coordinates || map.getZoom() < 11"
            block
            outlined
            color="btncolor"
            @click="downloadGeotiff(bbox)"
          >
            Download getekende polygoon
          </v-btn>
          <v-btn
            class="mb-1"
            :disabled="downloading"
            block
            outlined
            color="btncolor"
            @click="downloadYearMap()"
          >
            Hele beheergebied jaarkaart
          </v-btn>
        </div>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import SelectPeriod from '../components/SelectPeriod'
import moment from 'moment'

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
    },
    timeMode: {
      type: Object
    }
  },
  computed: {
    downloadText() {
      const selectedLayers = this.layers.filter(x => x.active)
      const layernames = selectedLayers.map(layer => layer.name)
      return `Lagen: ${layernames.join(', ')} voor de ${this.timeMode.name.toLowerCase()}kaart ${moment(this.dateBegin).startOf(this.timeMode.interval).format(this.timeMode.momentFormat)} worden gedownload. Een moment geduld aub.`
    },
    timeSelectionText() {
      return `${this.timeMode.name.toLowerCase()}kaart ${moment(this.dateBegin).startOf(this.timeMode.interval).format(this.timeMode.momentFormat)}`
    }
  },
  data() {
    return {
      bbox: {},
      draw: {},
      downloading: false,
      error: ''
    }
  },
  components: { SelectPeriod },
  mounted() {
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    })
    this.createDrawTools()
  },
  beforeDestroy() {
    this.map.removeControl(this.draw)
    this.map.off('draw.create', this.createFunc)
    this.map.off('draw.update', this.updateFunc)
    this.map.off('draw.delete', this.deleteFunc)
    this.draw = {}
  },
  methods: {
    createDrawTools() {
      // loaded checks tiles. Video tiles are loading dynamicly
      // temporary monkeypatch loaded function, because video layers are not always loaded
      // keep the old loaded function
      let oldLoaded = this.map.loaded
      // always return true
      this.map.loaded = (() => true)
      // add the control
      this.map.addControl(this.draw, 'top-right')
      // Now restore old loaded function
      this.map.loaded = oldLoaded
      this.map.on('draw.create', this.createFunc)
      this.map.on('draw.update', this.updateFunc)
      this.map.on('draw.delete', this.deleteFunc)
    },
    createFunc() {
      if (this.draw.getAll().features.length > 1) {
        const oldId = this.draw.getAll().features[0].id
        this.draw.delete(oldId)
      }
      this.bbox = this.draw.getAll().features[0].geometry
    },
    updateFunc() {
      this.bbox = this.draw.getAll().features[0].geometry
    },
    deleteFunc() {
      this.bbox = {}
    },
    downloadCurrentView() {
      const bbox = this.getBbox()
      this.downloadGeotiff(bbox)
    },
    getBbox() {
      // Get bounding box of the current view
      var N = this.map.getBounds().getNorth()
      var E = this.map.getBounds().getEast()
      var S = this.map.getBounds().getSouth()
      var W = this.map.getBounds().getWest()
      return {
        type: 'Polygon',
        coordinates: [[[W, N], [W, S], [E, S], [E, N], [W, N]]]
      }
    },
    downloadGeotiff(bbox) {
      this.downloading = true
      this.error = ''
      var selectedLayers = this.layers.filter(x => x.active)
      selectedLayers.forEach(layer => {
        var jsonBody = {
          region: bbox,
          dateBegin: this.dateBegin,
          dateEnd: this.dateEnd,
          assetType: this.timeMode.interval,
          vis: layer.vis,
          scale: 10
        }
        fetch(`${this.$store.state.SERVER_URL}/map/${layer.dataset}/export/`, {
          method: 'POST',
          body: JSON.stringify(jsonBody),
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
            this.downloading = false
          })
          .catch(error => {
            this.error = "Er is iets mis gegaan bij het downloaden. Excuses voor het ongemak."
          })
      })
    },

    downloadYearMap() {
      // Downlaod the seasonal map for latest year, entire netherlands
      // TODO: URL doesn't give the correct tiff back yet.
      window.open(
        `https://storage.cloud.google.com/vegetatiemonitor/yearly-classified-geotiffs/classified-image-2020.tif`
      )
    }
  }
}
</script>

<style scoped>
#checkbox {
  height: 100%;
  margin: auto;
}

.cardlayout {
  width: 100%;
  height: 48px;
}

.download {
  max-height: 100%;
  height: 100%;
  width: 100%;
}
</style>
