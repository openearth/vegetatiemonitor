<template>
  <v-toolbar dense color="primary" absolute prominent app>
    <v-toolbar-side-icon @click.native="changeDrawer()"> </v-toolbar-side-icon>
    <v-toolbar-title class="hidden-sm-and-down"
      >Vegetatie Monitor</v-toolbar-title
    >
    <v-spacer />
    <v-flex xs-6>
      <v-tabs color="primary" fixed-tabs>
        <v-tab v-for="mode in modes" :key="mode">
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
  data: function() {
    return {
      modes: ['Veld', 'Verken', 'Voorspel']
    }
  },
  methods: {
    changeDrawer() {
      const newVal = this.$store.state.drawer ? false : true
      this.$store.commit('setDrawer', newVal)
    }
  }
}
</script>

<style></style>
