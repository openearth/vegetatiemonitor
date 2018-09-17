<template>
  <div>
  <v-expansion-panel class="v-selection-panel">
    <v-expansion-panel-content>
      <v-toolbar class="toolbar" dense flat slot="header" color="grey lighten-4">
        <v-toolbar-title>
          Selecteer Beeld
        </v-toolbar-title>
      </v-toolbar>
      <v-list dense pt-0>
        <v-list-tile pt-0 id='selection'>
          <v-layout row wrap>
            <v-flex xs8 sm5>
              <v-menu ref="beginMenu" lazy :close-on-content-click="false" v-model="beginMenu" transition="scale-transition" offset-y full-width :nudge-right="40" min-width="290px" :return-value.sync="beginDate">
                <v-text-field slot="activator" label="Start datum" v-model="beginDate" prepend-icon="event" readonly></v-text-field>
                <v-date-picker v-model="beginDate" no-title scrollable>
                  <v-btn flat color="primary" @click="beginMenu = false">Cancel</v-btn>
                  <v-btn flat color="primary" @click="$refs.beginMenu.save(beginDate)">OK</v-btn>
                </v-date-picker>
              </v-menu>
            </v-flex>
            <v-flex xs8 sm5 offset-xs1>
              <v-menu ref="endMenu" lazy :close-on-content-click="false" v-model="endMenu" transition="scale-transition" offset-y full-width :nudge-right="40" min-width="290px" :return-value.sync="endDate">
                <v-text-field slot="activator" label="Eind datum" v-model="endDate" prepend-icon="event" readonly></v-text-field>
                <v-date-picker v-model="endDate" no-title scrollable>
                  <v-btn flat color="primary" @click="endMenu = false">Cancel</v-btn>
                  <v-btn flat color="primary" @click="$refs.endMenu.save(endDate)">OK</v-btn>
                </v-date-picker>
              </v-menu>
            </v-flex>
          </v-layout>
        </v-list-tile>
        <v-divider></v-divider>
        <v-list-tile>
          <v-radio-group v-model="radioButtons" row dense>
            <v-radio label="Composiet" value="radio-composite"></v-radio>
            <v-radio label="1 beeld" value="radio-1-image"></v-radio>
          </v-radio-group>
        </v-list-tile>
        <v-divider></v-divider>
        <v-list-tile>
          <v-list-tile-title>Selecteer beeld(en) voor analyse: </v-list-tile-title>
        </v-list-tile>
        <v-list-tile id='selection'>
          <v-layout row wrap>
            <v-flex xs8 sm5>
              <v-select :disabled="radioButtons === 'radio-composite'" v-model="firstImage" :items="Image1" label="Beeld 1" prepend-icon="insert_photo" single-line></v-select>
            </v-flex>
            <!-- <v-flex xs8 sm5 offset-xs1>
              <v-select smaller disabled v-model="secondImage" :items="Image2" label="Image 2" prepend-icon="insert_photo" single-line></v-select>
            </v-flex> -->
          </v-layout>
        </v-list-tile>
      </v-list>
    </v-expansion-panel-content>
  </v-expansion-panel>
  <v-expansion-panel class="v-selection-panel">
    <v-expansion-panel-content>
      <v-toolbar class="toolbar" dense flat slot="header" color="grey lighten-4">
        <v-toolbar-title>
          Classificatie
        </v-toolbar-title>
      </v-toolbar>
        <v-list-tile>
          <v-btn :disabled="checkClassificationButton()" v-on:click.native="changeModus(['landuse', 'landuse-vs-legger'])" outline color="indigo">Classificeer huidig gebied
            <v-icon right>refresh</v-icon>
          </v-btn>
        </v-list-tile>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </div>
</template>

<script src="./v-selection-panel.js"></script>

<style scoped>
#selection {
  padding: 0px;
  width: 100%;
}

#analysis-panel {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
}

.analysis-panel {
  top: 50vh;
  max-height: 50vh;
  overflow-y: auto;
}

</style>
