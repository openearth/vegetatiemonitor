<template>
<v-expansion-panel class="v-analysis-control">
  <v-expansion-panel-content>
    <v-toolbar class="toolbar " flat slot="header" color="grey lighten-4">
      <v-toolbar-title>
        Analyse
      </v-toolbar-title>
    </v-toolbar>
    <v-card id="snalysistable">
      <v-data-table :headers="headers" :items="items" hide-actions class="elevation-1 ">
        <template slot="items" slot-scope="props">
          <td class="text-xs6-left">{{ props.item.name }}</td>
          <td class="text-xs6-left">{{ props.item.data }}</td>
        </template>
      </v-data-table>
      <canvas id="doughnut-chart"></canvas>
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

#doughnut-chart {
  width: 100%;
  height: 100%;
}
</style>
