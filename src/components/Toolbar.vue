<template>
  <v-toolbar dense app fixed color="secondary" prominent class="pa-0">
    <v-toolbar-side-icon @click="drawer = true"> </v-toolbar-side-icon>
    <v-toolbar-title class="hidden-sm-and-down"
      >Vegetatie Monitor</v-toolbar-title
    >
    <v-spacer />
    <v-flex xs-6>
      <v-tabs color="secondary" fixed-tabs>
        <v-tab v-for="mode in modes" :key="mode" :to="{ name: mode }">
          {{ mode }}
        </v-tab>
      </v-tabs>
    </v-flex>
    <v-spacer />

    <v-img
      contain
      aspect-ratio="1"
      min-height="100%"
      max-height="100%"
      class="hidden-sm-and-down logo"
      src="images/deltares.svg"
    />
    <v-img
      contain
      aspect-ratio="1"
      min-height="100%"
      max-height="100%"
      class="hidden-sm-and-down logo"
      src="images/Rijkswaterstaat.svg"
    />
  </v-toolbar>
</template>

<script>
export default {
  name: 'toolbar',
  props: {
    drawerstate: {
      type: Boolean
    }
  },
  computed: {
    drawer: {
      get() {
        return this.drawerstate
      },
      set(drawerstate) {
        this.$emit('setDrawerstate', drawerstate)
      }
    }
  },
  data: function() {
    return {
      modes: ['Veld', 'Verken', 'Voorspel']
    }
  }
}
</script>

<style>
.v-toolbar__content,
.v-toolbar__extension {
  padding: 0 12px;
}
</style>
