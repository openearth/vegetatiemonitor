<template>
  <div id="analyse">
    <v-card small flat>
      <v-card-title>
        <h1>
          Analyse
        </h1>
      </v-card-title>
    </v-card>
    <v-card id="analysistable" flat>
      <v-data-table
        id="data-table"
        :headers="headers"
        rows-per-page-text=""
        :rowsPerPageItems="[10]"
        :items="polygons"
        :pagination.sync="pagination"
      >
        <template slot="items" slot-scope="props">
          <td class="text-xs6-left">{{ props.item.name }}</td>
          <td class="text-xs6-left">{{ props.item.data }}</td>
        </template>
      </v-data-table>
      <v-flex xs2 offset-xs5>
        <v-progress-circular
          v-if="workLoad > 0"
          indeterminate
        ></v-progress-circular>
      </v-flex>
      <canvas ref="landuse-canvas"></canvas>
      <canvas ref="legger-canvas"></canvas>
      <v-btn
        v-on:click.native="closeSelectMode()"
        v-if="selectMode"
        outline
        color="indigo"
        >Verwijder
        <v-icon right>close</v-icon>
      </v-btn>
      <v-btn
        :disabled="workLoad > 0"
        v-on:click.native="downloadSelection()"
        v-if="selectMode"
        outline
        color="indigo"
        >Download
        <v-icon right>file_download</v-icon>
      </v-btn>
    </v-card>
  </div>
</template>

<script>
// import _ from 'lodash'
// import mapboxgl from 'mapbox-gl'
// import Chart from 'chart.js'
// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'

export default {
  name: 'v-analysis-control',
  props: {
    map: {
      type: Object
    },
    selection: {
      type: Object
    }
  },
  computed: {
    layers() {
      return this.$store.state.layers
    }
  },
  data() {
    return {
      perceelnumber: null,
      canvas: {},
      chart: {},
      workLoad: 0,
      leggerLabels: [],
      leggerData: [],
      landuseLabels: [],
      landuseData: [],
      headers: [
        {
          text: 'Eigenschap',
          align: 'left',
          sortable: false,
          value: 'name',
          width: '40%'
        },
        {
          text: 'Kwantiteit',
          value: 'data',
          align: 'left',
          sortable: false,
          width: '60%'
        }
      ],
      polygons: [],
      polygonSelected: false,
      pagination: {
        rowsPerPage: 4
      },
      selectMode: false,
      selectLayer: ''
    }
  },
  watch: {}
}
</script>

<style></style>
