<template>
  <div class="viewer">
    <v-content id="content">
      <map-component :layers="layers" />
    </v-content>
    <toolbar
      :drawerstate="drawerstate"
      @setDrawerstate="drawerstate = $event"
    />
    <drawer
      :drawerstate="drawerstate"
      :layers="layers"
      @setDrawerstate="drawerstate = $event"
      v-on:setLayers="layers = $event"
    />
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import MapComponent from '@/components/MapComponent'
import Drawer from '@/components/Drawer'

import { mapLayers } from '../config/map-layers-config.js'

export default {
  name: 'viewer',
  data: function() {
    return {
      drawerstate: true,
      layers: mapLayers
    }
  },
  components: {
    Toolbar,
    MapComponent,
    Drawer
  },
  computed: {
    mapLayers: {
      get() {
        return this.layers
      },
      set(layers) {
        this.layers = layers
      }
    }
  },
  methods: {}
}
</script>

<style>
.viewer {
  width: 100%;
  height: 100%;
}

#content {
  height: 100%;
}
.v-list__tile__title,
.v-select__selection {
  font-size: 14px;
  -moz-osx-font-size: 14px;
  -webkit-font-size: 14px;
}
</style>
