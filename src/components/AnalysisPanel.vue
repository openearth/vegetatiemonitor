<template>
<div class="analysis-panel">
  <v-card dense pt-0>
    <v-layout row wrap>
      <v-flex xs11 sm5>
        <v-menu ref="menu" lazy :close-on-content-click="false" v-model="menu" transition="scale-transition" offset-y full-width :nudge-right="40" min-width="290px" :return-value.sync="date">
          <v-text-field slot="activator" label="Pick date 1" v-model="date" prepend-icon="event" readonly></v-text-field>
          <v-date-picker v-model="date" no-title scrollable>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="menu = false">Cancel</v-btn>
            <v-btn flat color="primary" @click="$refs.menu.save(date)">OK</v-btn>
          </v-date-picker>
        </v-menu>
      </v-flex>
      <v-spacer></v-spacer>
      <v-flex xs11 sm5>
        <v-dialog ref="dialog" persistent v-model="modal" lazy full-width width="290px" :return-value.sync="date">
          <v-text-field slot="activator" label="Pick date 2" v-model="date" prepend-icon="event" readonly></v-text-field>
          <v-date-picker v-model="date" scrollable>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="modal = false">Cancel</v-btn>
            <v-btn flat color="primary" @click="$refs.dialog.save(date)">OK</v-btn>
          </v-date-picker>
        </v-dialog>
      </v-flex>
    </v-layout>
  </v-card>

</div>
</template>

<script src="./analysis-panel.js"></script>

<style scoped>
</style>
