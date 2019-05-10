<template>
  <v-app>
    <v-toolbar dense color="primary" fixed app>
      <v-toolbar-side-icon></v-toolbar-side-icon>
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
      <v-img class="hidden-sm-and-down" src="images/deltares.svg" />
      <v-img class="hidden-sm-and-down" src="images/Rijkswaterstaat.svg" />
    </v-toolbar>
  </v-app>
</template>

<script>
export default {
  name: 'app',
  data: function() {
    return {
      modes: ['Veld', 'Verken', 'Voorspel']
    }
  },
  components: {}
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
