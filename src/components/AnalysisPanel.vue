<template>
<div class="analysis-panel">
  <v-switch v-model="" <v-tile dense pt-0>
    Select range of dates to find Images
    <v-layout row wrap>
      <v-flex xs11 sm5>
        <v-menu ref="menu" lazy :close-on-content-click="false" v-model="menu" transition="scale-transition" offset-y full-width :nudge-right="40" min-width="290px" :return-value.sync="beginDate">
          <v-text-field slot="activator" label="Start date" v-model="beginDate" prepend-icon="event" readonly></v-text-field>
          <v-date-picker v-model="beginDate" no-title scrollable>
            <v-btn flat color="primary" @click="menu = false">Cancel</v-btn>
            <v-btn flat color="primary" @click="$refs.menu.save(beginDate)">OK</v-btn>
          </v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs11 sm5>
        <v-dialog ref="dialog" persistent v-model="modal" lazy full-width width="290px" :return-value.sync="EndDate">
          <v-text-field slot="activator" label="End date" v-model="EndDate" prepend-icon="event" readonly></v-text-field>
          <v-date-picker v-model="EndDate" scrollable>
            <v-btn flat color="primary" @click="modal = false">Cancel</v-btn>
            <v-btn flat color="primary" @click="$refs.dialog.save(EndDate)">OK</v-btn>
          </v-date-picker>
        </v-dialog>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs11 sm5>
        <v-select :items="items" v-model="e1" label="Select" single-line></v-select>
      </v-flex>
      <v-flex xs11 sm5>
        <v-select :items="items" v-model="e1" label="Select" single-line></v-select>
      </v-flex>
    </v-layout>
    </v-tile>

</div>
</template>

<script src="./analysis-panel.js"></script>

<style scoped>
</style>
