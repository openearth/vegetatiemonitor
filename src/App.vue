<template>
  <v-app>
    <toolbar />
    <drawer />

    <v-content>
      <map-component />
    </v-content>
  </v-app>
</template>

<script>
import Toolbar from './components/Toolbar'
import MapComponent from './components/MapComponent'
import Drawer from './components/Drawer'

export default {
  name: 'app',
  data: function() {
    return {}
  },
  components: {
    Toolbar,
    MapComponent,
    Drawer
  }
}
</script>

<style>
html {
  width: 100vw;
  height: 100vh;
  overflow-y: hidden;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
