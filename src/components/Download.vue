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
        <select-period
          :startDateDef="startDate"
          :endDateDef="endDate"
          @set-start-date="startDate = $event"
          @set-end-date="endDate = $event"
        ></select-period>
      </v-flex>
      <v-flex grow>
        <div class="pa-4">
          <v-alert outlined type="info" v-if="bbox.coordinates">
            Een polygoon is geselecteerd en kan gedownload worden!
          </v-alert>
          <v-alert outlined type="info" v-if="downloading">
            {{
              `Lagen: ${selectedLayers()} voor de periode: ${
                this.startDate
              } tot ${
                this.endDate
              } worden gedownload. Een klein momentje geduld aub.`
            }}
          </v-alert>
          <v-alert outlined type="warning" v-if="map.getZoom() < 9">
            Zoom in op de kaart om het te downloaden gebied te verkleinen.
          </v-alert>
        </div>
      </v-flex>
      <v-flex shrink>
        <div class="pa-4">
          <v-layout row wrap>
            <v-btn
              class="mb-1"
              :disabled="downloading"
              block
              outlined
              color="btncolor"
              @click="downloadCurrentView()"
            >
              Download huidige viewerbeeld
            </v-btn>
            <v-btn
              class="mb-1"
              :disabled="downloading || bbox.coordinates || map.getZoom() > 9"
              block
              outlined
              color="btncolor"
              @click="downloadGeotiff(bbox)"
            >
              Download geselecteerd polygoon
            </v-btn>
            <v-btn
              class="mb-1"
              :disabled="downloading"
              block
              outlined
              color="btncolor"
              @click="downloadYearMap()"
            >
              Volledige beheergebied jaarkaart
            </v-btn>
          </v-layout>
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
      draw: {},
      startDate: moment()
        .startOf('year')
        .format('YYYY-MM-DD'),
      endDate: moment()
        .startOf('year')
        .add(1, 'year')
        .format('YYYY-MM-DD'),
      downloading: false
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

    this.map.on('draw.delete', () => {
      this.bbox = {}
    })
  },
  beforeDestroy() {
    this.map.removeControl(this.draw)
    this.map.off('draw.create')
    this.map.off('draw.update')
    this.map.off('draw.delete')
  },
  methods: {
    downloadCurrentView() {
      const bbox = this.getBbox()
      this.downloadGeotiff(bbox)
    },
    getBbox() {
      var N = this.map.getBounds().getNorth()
      var E = this.map.getBounds().getEast()
      var S = this.map.getBounds().getSouth()
      var W = this.map.getBounds().getWest()
      return {
        type: 'Polygon',
        coordinates: [[[W, N], [W, S], [E, S], [E, N], [W, N]]]
      }
    },
    selectedLayers() {
      const selectedLayers = this.dataLayers.filter(x => x.active)
      const layernames = selectedLayers.map(layer => layer.name)
      return layernames.join(', ')
    },
    downloadGeotiff(bbox) {
      this.downloading = true
      var selectedLayers = this.dataLayers.filter(x => x.active)
      selectedLayers.forEach(layer => {
        var json_body = {
          region: bbox,
          dateBegin: this.startDate,
          dateEnd: this.endDate,
          vis: layer.vis,
          scale: 10
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
            this.downloading = false
          })
      })
    },

    downloadYearMap() {
      // Downlaod the seasonal map for latest year, entire netherlands
      // TODO: URL doesn't give the correct tiff back yet.
      window.open(
        `https://storage.cloud.google.com/vegetatiemonitor/yearly-classified-geotiffs/classified-image-2019.tif`
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
