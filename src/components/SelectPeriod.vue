<template>
  <v-layout column px-2>
    <v-layout justify-space-around>
      <v-flex xs12 pr-2>
        <v-menu full-width ref="startDate" :nudge-right="40">
          <template v-slot:activator="{ on }">
            <v-text-field
              :rules="[rules.checkDiff]"
              slot="activator"
              v-model="startDate"
              label="Begin datum"
              prepend-icon="event"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="startDate" no-title></v-date-picker>
        </v-menu>
      </v-flex>
    </v-layout>
    <v-layout justify-space-around>
      <v-flex xs12 pr-2>
        <v-menu full-width ref="endDate" :nudge-right="40">
          <template v-slot:activator="{ on }">
            <v-text-field
              :rules="[rules.checkDiff]"
              slot="activator"
              v-model="endDate"
              label="Eind datum"
              prepend-icon="event"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="endDate" no-title></v-date-picker>
        </v-menu>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import moment from 'moment'
export default {
  name: 'v-select-period',
  props: {
    startDateDef: {
      type: String
    },
    endDateDef: {
      type: String
    }
  },
  data() {
    return {
      rules: {
        checkDiff: () => {
          var start = moment(this.startDate, 'YYYY-MM-DD')
          var end = moment(this.endDate, 'YYYY-MM-DD')
          return end.diff(start) > 0 || 'End date < start date'
        }
      }
    }
  },
  computed: {
    startDate: {
      get: function() {
        return moment(this.startDateDef).format('YYYY-MM-DD')
      },
      set: function(date) {
        this.$emit('set-start-date', date)
      }
    },
    endDate: {
      get: function() {
        return moment(this.endDateDef).format('YYYY-MM-DD')
      },
      set: function(date) {
        this.$emit('set-end-date', date)
      }
    }
  }
}
</script>

<style scoped>
.v-menu__content {
  min-width: min-content !important;
  overflow-y: hidden;
}
</style>
