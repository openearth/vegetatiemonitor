<template>
<div class="analysis-panel">
  <v-toolbar flat>
    <v-list>
      <v-list-tile>
        <v-list-tile-title class="title">
          Analysis Panel
        </v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-toolbar>
  <v-list dense pt-0>
    <v-list-tile>
      <v-list-tile-action>
        <v-switch v-model="imageMode"></v-switch>
      </v-list-tile-action>
      <v-list-tile-title>Switch to compare mode</v-list-tile-title>
    </v-list-tile>
    <v-list-tile>
      <v-list-tile-title>Select the range of dates to get Images: </v-list-tile-title>
    </v-list-tile>
    <v-list-tile dense pt-0 id='selection'>
      <v-layout row wrap>
        <v-flex xs11 sm5>
          <v-menu ref="beginMenu" lazy :close-on-content-click="false" v-model="beginMenu" transition="scale-transition" offset-y full-width :nudge-right="40" min-width="290px" :return-value.sync="beginDate">
            <v-text-field slot="activator" label="Start date" v-model="beginDate" prepend-icon="event" readonly></v-text-field>
            <v-date-picker v-model="beginDate" no-title scrollable>
              <v-btn flat color="primary" @click="beginMenu = false">Cancel</v-btn>
              <v-btn flat color="primary" @click="$refs.beginMenu.save(beginDate)">OK</v-btn>
            </v-date-picker>
          </v-menu>
        </v-flex>
        <v-flex xs11 sm5 offset-xs1>
          <v-menu ref="endMenu" lazy :close-on-content-click="false" v-model="endMenu" transition="scale-transition" offset-y full-width :nudge-right="40" min-width="290px" :return-value.sync="endDate">
            <v-text-field slot="activator" label="End date" v-model="endDate" prepend-icon="event" readonly></v-text-field>
            <v-date-picker v-model="endDate" no-title scrollable>
              <v-btn flat color="primary" @click="endMenu = false">Cancel</v-btn>
              <v-btn flat color="primary" @click="$refs.endMenu.save(endDate)">OK</v-btn>
            </v-date-picker>
          </v-menu>
          </v-dialog>
        </v-flex>
      </v-layout>
    </v-list-tile>
    <v-list-tile id='selection'>
      <v-layout row wrap>
        <v-flex xs11 sm5>
          <v-select v-model="firstImage" :items="Image1" label="Image 1" prepend-icon="insert_photo" single-line></v-select>
        </v-flex>
      <v-flex xs11 sm5 offset-xs1>
        <v-select v-model="secondImage" :items="Image2" label="Image 2" prepend-icon="insert_photo" single-line></v-select>
      </v-flex>
      </v-layout>
    </v-list-tile>
  </v-list>
</div>
</template>

<script src="./analysis-panel.js"></script>

<style>
#selection {
  padding: 0px;
  width: 100%;
}

#analysis-panel {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
}

.analysis-panel {
  bottom: 10vh;
  height: 50vh;
}
</style>
