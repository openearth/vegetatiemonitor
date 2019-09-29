<template>
<div id="analyse">
  <v-layout column fill-height>
    <v-flex xs3>
      <h1 class="pa-4">
        Analyse
      </h1>
      <p class="px-4"> Selecteer de laag om polygonen te gebruiken </p>
      <v-radio-group v-model="selectedLayer">
        <v-layout id="cardlayout" align-center v-for="layer in layers" :key="layer.name" class="px-4">
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
      <div class="pa-4">
        <v-alert outlined type="info" v-if="selectedProperty === ''">
          <p>
            Voor analyse: <br>
            Selecteer een polygoon door op de kaart te klikken. <br>
            Selecteer het jaar via de tijdsbalk.
          </p>
        </v-alert>
      </div>
      <div v-for="(type, index) in datatypes" :key="index">
        <v-echarts :ref="index" :datatype="type.datatype" :polygon="polygon" :dateBegin="dateBegin" :dateEnd="dateEnd" :zonalType="type.zonalType" :timeMode="timeMode" @loaded="loading = $event" @add-graph="graphs.push($event)"></v-echarts>
      </div>
      <v-timeseries v-if="$route.name === 'voorspel'" :options="voorspelOptions">
      </v-timeseries>
    </v-flex>
    <v-flex xs1>
      <v-layout fill-height justify-space-around align-space-around class="px-auto py-4">
        <v-btn v-on:click.native="closeSelectMode()" v-if="selectedProperty !== ''" outlined color="indigo">Verwijder
          <v-icon right>close</v-icon>
        </v-btn>
        <v-btn :disabled="loading" v-on:click.native="downloadSelection()" v-if="selectedProperty !== ''" outlined color="indigo">Download
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
import html2canvas from 'html2canvas'
import moment from 'moment'

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
    },
    timeMode: {
      type: Object
    }
  },
  watch: {
    selectedLayer: {
      handler(newValue, oldValue) {
        if (newValue) {
          this.layers.forEach(layer => {
            if (layer.name === newValue.name) {
              layer.active = true
            } else {
              layer.active = false
            }
            this.$emit('setLayer', layer)
          })
          this.addEventListenersToMap(newValue)
        }
        if (oldValue) {
          this.removeEventListenersFromMap(oldValue)
        }
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
      leggerLabels: [],
      graphs: []
    }
  },
  mounted() {
    // When mounted set a default layer. If none selected -> none, if 1 layer selected
    // choose that layer, if both selected -> choose first one.
    const activeLayers = this.layers.filter(layer => layer.active)
    this.selectedLayer = activeLayers.shift()
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

      const graphW = [W * 0.5, W * 0.05, W * 0.5]
      const graphH = [H * 0.05, H * 0.3, H * 0.3]
      let chartCanvas = document.querySelectorAll(".chart canvas")
      const graphs = [...chartCanvas]
      graphs.forEach((graph, i) => {
        var gw = graph.width
        var gh = graph.height
        const data = graph.toDataURL()
        doc.addImage(
          data,
          'PNG',
          graphW[i],
          graphH[i],
          0.25 * W,
          ((0.25 * W) / gw) * gh
        )
      })
      const table = []
      this.properties.forEach(prop => {
        table.push([prop.name, prop.data])
      })
      doc.autoTable(['Eigenschappen polygoon', ''], table, {
        startY: 0.05 * H,
        tableWidth: 0.4 * W,
      })
      this.takeScreenshot(this.map).then(data => {
        var canvas = this.map.getCanvas()
        var mapw = canvas.width
        var maph = canvas.height

        doc.addImage(
          data,
          'JPEG',
          W * 0.05,
          0.5 * H,
          0.9 * W,
          ((0.9 * W) / mapw) * maph
        )
        const perceelnumber = this.properties.find(prop => prop.name === 'Perceel nummer')
        if (perceelnumber) {
          doc.save(`${perceelnumber.data}_${moment(this.dateBegin).startOf(this.timeMode.interval).format(this.timeMode.momentFormat)}_${this.timeMode.name.toLowerCase()}kaart_${this.perceelnumber}.pdf`)
        } else  {
          doc.save(`Leggerpolygoon_${moment(this.dateBegin).startOf(this.timeMode.interval).format(this.timeMode.momentFormat)}_${this.timeMode.name.toLowerCase()}kaart_${this.perceelnumber}.pdf`)
        }
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
