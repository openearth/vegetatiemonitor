<template>
  <div id="analyse">
    <v-layout column fill-height justify-end>
      <h1 class="pa-4">
        Analyse
      </h1>
      <v-flex xs11 align-stretch>
        <div id="analysistable">
          <information-table :properties="properties"> </information-table>
          <div id="pie-div" v-for="datatype in datatypes" :key="datatype">
            <v-piechart
              :datatype="datatype"
              :polygon="polygon"
              :dateBegin="dateBegin"
              :dateEnd="dateEnd"
              @loaded="loading = $event"
            ></v-piechart>
          </div>
        </div>
      </v-flex>
      <v-flex xs1>
        <v-layout justify-space-around align-space-around>
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
import VPiechart from './VPiechart'
import InformationTable from './InformationTable'

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
  watch: {
    map() {
      if (!this.layers) return
      this.watchMapForAnalysis()
    }
  },
  data() {
    return {
      selectMode: false,
      datatypes: [],
      polygon: [],
      properties: [],
      selectedProperty: ''
    }
  },

  mounted() {},
  methods: {
    watchMapForAnalysis() {
      this.layers.forEach(layer => {
        // Creaet a hover effect and fill in the data in the datatable when
        // hovering over a layer which has a hoverFilter
        if (layer.hoverFilter) {
          this.map.on('mousemove', layer.baseLayer, e => {
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
          })
          this.map.on('mouseleave', layer.baseLayer, () => {
            this.map.getCanvas().style.cursor = ''
            this.map.setFilter(layer.hoverFilter, [
              '==',
              layer.selectProperty,
              ''
            ])
          })
        }
        // When clicking on a layer which has a selctFilter create Piecharts
        if (layer.selectFilter) {
          this.map.on('click', layer.baseLayer, e => {
            this.datatypes = []
            let filter = ''
            if (this.selectedProperty === layer.selectProperty) {
              this.selectedProperty = ''
            } else {
              this.selectedProperty = layer.selectProperty
              const feature = this.map.queryRenderedFeatures(e.point, {
                layers: [layer.baseLayer]
              })[0]
              this.datatypes = layer.datatypes
              this.polygon = feature.geometry
              filter = e.features[0].properties[layer.selectProperty]
              this.loading = true
            }
            this.map.setFilter(layer.selectFilter, [
              '==',
              layer.selectProperty,
              filter
            ])
          })
        }
      })
    },

    closeSelectMode() {
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
    }
  },
  components: {
    VPiechart,
    InformationTable
  }
}
</script>

<style>
#analyse,
#pie-div,
#analyse-card {
  height: 100%;
  width: 100%;
}
</style>
