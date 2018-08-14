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
        <div>
          Voor algemene vragen over de vegetatiemonitor en de achtergronden bij deze ontwikkeling <a href="mailto:stanford.wilson@rws.nl?subject=Vegetatiemonitor">Stanford Wilson</a> <br>
          Voor technische vragen: <a href="mailto:ellis.penning@deltares.nl?subject=Vegetatiemonitor">Ellis Penning</a> <br>
          <a href="static/docs/TRM.pdf" download>Technische referentie handleiding</a>
        </div>
      </v-card-title>
    </v-card>
  </v-expansion-panel-content>
</v-expansion-panel>
</template>

<style scoped>
.v-colofon {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: left;
}
</style>
