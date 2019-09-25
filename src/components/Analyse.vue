<template>
  <div id="analyse">
    <v-layout column fill-height>
      <v-flex xs3>
        <h1 class="pa-4">
          Analyse
        </h1>
        <p class="pa-4"> Selecteer de laag om polygonen te gebruiken </p>
          <v-radio-group v-model="selectedLayer">
            <v-layout
              id="cardlayout"
              align-center
              v-for="layer in dataLayers"
              :key="layer.name"
            >
              <v-flex xs2>
                <v-radio :value="layer"></v-radio>
              </v-flex>
              <v-flex xs2>
                <v-img contain max-height="100%" class="ma-1" :src="layer.icon" />
              </v-flex>
              <v-flex xs7>
                {{ layer.name }}
              </v-flex>
            </v-layout>
          </v-radio-group>
        <div id="analysistable">
          <information-table :properties="properties"> </information-table>
        </div>
      </v-flex>
      <v-flex id="piediv" xs8 align-stretch>
        <div v-for="(type, index) in datatypes" :key="index">
          <v-echarts
            :ref="index"
            :datatype="type.datatype"
            :polygon="polygon"
            :dateBegin="dateBegin"
            :dateEnd="dateEnd"
            :zonalType="type.zonalType"
            @loaded="loading = $event"
          ></v-echarts>
        </div>
        <v-timeseries
          v-if="$route.name === 'voorspel'"
          :options="voorspelOptions"
        >
        </v-timeseries>
      </v-flex>
      <v-flex xs1>
        <v-layout
          fill-height
          justify-space-around
          align-space-around
          class="pa-auto"
        >
          <v-btn
            v-on:click.native="closeSelectMode()"
            v-if="selectedProperty !== ''"
            outlined
            color="indigo"
            >Verwijder
            <v-icon right>close</v-icon>
          </v-btn>
          <v-btn
            :disabled="loading"
            v-on:click.native="downloadSelection()"
            v-if="selectedProperty !== ''"
            outlined
            color="indigo"
            >Download
            <v-icon right>file_download</v-icon>
          </v-btn>
        </v-layout>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import VEcharts from './VEcharts'
import InformationTable from './InformationTable'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default {
  name: 'v-analysis-control',
  props: {
    layers: {
      type: Array
    },
    map: {
      type: Object,
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
      },
      set(layers) {
        this.$emit('update:layers', layers)
      }
    }
  },
  watch: {
    selectedLayer: {
      handler(newValue, oldValue) {
        this.layers.forEach(layer => {
          if(layer.name === newValue.name) {
            layer.active = true
          } else {
            layer.active = false
          }
          this.$emit('setLayer', layer)
        })
        console.log(oldValue, newValue)
        this.addEventListenersToMap(newValue)
        this.removeEventListenersFromMap(oldValue)
      }
    }
  },
  data() {
    return {
      selectMode: false,
      datatypes: [],
      polygon: [],
      properties: [],
      selectedProperty: '',
      loading: true,
      landuseLabels: [],
      selectedLayer: {},
      leggerLabels: []
    }
  },
  mounted() {
    // When mounted set a default layer. If none selected -> none, if 1 layer selected
    // choose that layer, if both selected -> choose first one.
    const activeLayers = this.layers.filter(layer => layer.active)
    this.selectedLayer = activeLayers[0]
  },
  methods: {
    addEventListenersToMap(newLayers) {
      // Add all eventlisteners to the map for the selected layer
      this.map.on('mousemove', newLayers.baseLayer, this.onMouseMove)
      this.map.on('mouseleave', newLayers.baseLayer, this.onMouseLeave)
      this.map.on('click', newLayers.baseLayer, this.onClick)
    },

    removeEventListenersFromMap(oldLayers) {
      // Remove all eventlisteners to the map for the selected layer
      this.map.off('mousemove', oldLayers.baseLayer, this.onMouseMove)
      this.map.off('mouseleave', oldLayers.baseLayer, this.onMouseLeave)
      this.map.off('click', oldLayers.baseLayer, this.onClick)
    },
    onMouseMove(e) {
      const layer = this.selectedLayer
      // if layer not active, no action
      this.map.getCanvas().style.cursor = 'pointer'
      const filter = e.features[0].properties[layer.selectProperty]
      this.map.setFilter(layer.hoverFilter, [
        '==',
        layer.selectProperty,
        filter
      ])
      if (this.selectedProperty === '') {
        this.properties = []
        layer.tableProperties.forEach(prop => {
          this.properties.push({
            value: false,
            name: prop.name,
            data: e.features[0].properties[prop.key]
          })
        })
      }
    },
    onMouseLeave() {
      const layer = this.selectedLayer
      this.map.getCanvas().style.cursor = ''
      this.map.setFilter(layer.hoverFilter, [
        '==',
        layer.selectProperty,
        ''
      ])
    },
    onClick(e) {
      const layer = this.selectedLayer
      let filter = ''

      // if clicked on the already selected property, remove selection
      if (
        this.datatypes.length > 0 &&
        this.selectedProperty === layer.selectProperty
      ) {
        this.datatypes = []
        this.closeSelectMode()
      } else {
        this.datatypes = []
        this.selectedProperty = layer.selectProperty
        const feature = this.map.queryRenderedFeatures(e.point, {
          layers: [layer.baseLayer]
        })[0]
        // this.datatypes = layer.datatypes
        const datatypes = []
        layer.datatypes.forEach(type => {
          // TODO: use modes (and adjust mode options config) to make this if statement...
          if (this.$route.name === 'Voorspel' && type === 'landuse') {
            datatypes.push({
              datatype: type,
              zonalType: 'zonal-timeseries'
            })
          }
          datatypes.push({
            datatype: type,
            zonalType: 'zonal-info'
          })
        })
        this.datatypes = datatypes

        this.polygon = feature.geometry
        filter = e.features[0].properties[layer.selectProperty]
        this.loading = true
      }
      this.map.setFilter(layer.selectFilter, [
        '==',
        layer.selectProperty,
        filter
      ])
    },
    closeSelectMode() {
      this.selectedProperty = ''
      this.properties = []
      this.datatypes = []
      this.layers.forEach(layer => {
        if (layer.selectFilter) {
          this.map.setFilter(layer.selectFilter, [
            '==',
            layer.selectProperty,
            ''
          ])
        }
      })
      this.loading = true
    },
    // Build pdf with table, two piecharts and snapshot of mapbox
    downloadSelection() {
      var doc = new jsPDF()
      var W = doc.internal.pageSize.getWidth()
      var H = doc.internal.pageSize.getHeight()
      // var res = doc.autoTableHtmlToJson()
      doc.autoTable(document.getElementsByClassName('v-data-table')[0])
      if (this.$refs['legger']) {
        var imgData = this.$refs['legger'][0].$el.innerHTML
        doc.fromHTML(imgData, W * 0.1, H * 0.2)
      }
      if (this.$refs['landuse']) {
        imgData = this.$refs['landuse'][0].$el.innerHTML
        doc.fromHTML(imgData, W * 0.5, H * 0.2)
      }

      var table = []
      this.leggerLabels.forEach((label, i) => {
        table.push([label, this.leggerData[i]])
      })
      doc.autoTable(['Label', 'legger klassen [%]'], table, {
        startY: 0.35 * H,
        tableWidth: 0.4 * W,
        margin: { left: 0.05 * W }
      })
      table = []
      this.landuseLabels.forEach((label, i) => {
        table.push([label, this.landuseData[i]])
      })
      doc.autoTable(['Label', 'landuse klassen [%]'], table, {
        startY: 0.35 * H,
        tableWidth: 0.4 * W,
        margin: { left: W * 0.55 }
      })
      this.takeScreenshot(this.map).then(data => {
        var canvas = this.map.getCanvas()
        var mapw = canvas.width
        var maph = canvas.height

        doc.addImage(
          data,
          'JPEG',
          W * 0.05,
          0.6 * H,
          0.9 * W,
          ((0.9 * W) / mapw) * maph
        )
        doc.save(`${this.perceelnumber}_${this.dateEnd}_${this.dateBegin}.pdf`)
      })
    },

    // Note: Normally the preserveDrawerBuffer in the mapbox options is used. However This
    // is not yet build in vue2mapbox-gl and using this function the rendering of the image
    // will not reduce the performance of the mapbox components.
    takeScreenshot(map) {
      return new Promise(function(resolve) {
        map.once('render', function() {
          resolve(map.getCanvas().toDataURL())
        })
        /* trigger render */
        map.setBearing(map.getBearing())
      })
    }
  },
  beforeDestroy() {
    this.removeEventListenersFromMap(this.selectedLayer)
  },
  components: {
    VEcharts,
    InformationTable
  }
}
</script>

<style>
#analyse,
#analyse-card {
  height: 100%;
  width: 100%;
}

#piediv {
  overflow: auto;
}
</style>
