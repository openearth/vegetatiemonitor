<template>
<v-expansion-panel class="v-colofon">
  <v-expansion-panel-content>
    <v-toolbar class="toolbar" dense flat slot="header" color="grey lighten-4">
      <v-toolbar-title>
        Colofon
      </v-toolbar-title>
    </v-toolbar>
    <v-card small>
      <v-card-title primary-title>
        <pre>
Voor algemene vragen over de vegetatiemonitor en de achtergronden bij deze ontwikkeling: <a href="mailto:stanford.wilson@rws.nl?subject=Vegetatiemonitor">Stanford Wilson</a>
Voor technische vragen: <a href="mailto:ellis.penning@deltares.nl?subject=Vegetatiemonitor">Ellis Penning</a>
Download <a href="static/docs/TRM.pdf" download>hier</a> de Technische referentie handleiding.
Klik <a href="https://www.youtube.com/watch?v=mOjCRgauxyM&feature=youtu.be">hier</a> voor het instructiefilmpje. 
        </pre>
      </v-card-title>
    </v-card>
  </v-expansion-panel-content>
</v-expansion-panel>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: left;
}
</style>
