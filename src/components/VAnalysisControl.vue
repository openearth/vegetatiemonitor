<template>
<v-expansion-panel class="v-analysis-control">
  <v-expansion-panel-content>
    <v-toolbar class="toolbar " flat slot="header" color="grey lighten-4">
      <v-toolbar-title>
        Analyse
      </v-toolbar-title>
    </v-toolbar>
    <v-card id="analysistable">
      <v-btn v-on:click.native="closeSelectMode()" v-if="selectMode" outline color="indigo">Verwijder
        <v-icon right>close</v-icon>
      </v-btn>
      <v-btn v-on:click.native="downloadSelection()" v-if="selectMode" outline color="indigo">Download
        <v-icon right>file_download</v-icon>
      </v-btn>
      <v-data-table :headers="headers" rows-per-page-text="" :rowsPerPageItems="[10]" :items="polygons" :pagination.sync="pagination">
        <template slot="items" slot-scope="props">
          <td class="text-xs6-left">{{ props.item.name }}</td>
          <td class="text-xs6-left">{{ props.item.data }}</td>
        </template>
      </v-data-table>
      <v-flex xs2 offset-xs5>
        <v-progress-circular v-if="workLoad > 0" indeterminate ></v-progress-circular>
      </v-flex>
      <canvas id="legger-chart"></canvas>
      <canvas id="landuse-chart"></canvas>
    </v-card>
  </v-expansion-panel-content>
</v-expansion-panel>
</template>

<script src="./v-analysis-control.js"></script>

<style >
#v-analysis-control {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
}

#legger-chart {
  width: 100%;
  height: 100%;
}
</style>
