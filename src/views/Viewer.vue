<template>
  <div class="viewer">
    <toolbar
      :drawerstate="drawerstate"
      @setDrawerstate="drawerstate = $event"
      id="toolbar-comp"
    />

    <v-content id="content">
      <drawer
        :drawerstate="drawerstate"
        :layers="layers"
        @setDrawerstate="drawerstate = $event"
        v-on:setLayers="layers = $event"
        :map="map"
        :dateBegin="dateBegin"
        :dateEnd="dateEnd"
        class="navdrawer"
      />

      <map-component
        :layers="layers"
        :map="map"
        :dateBegin="dateBegin"
        :dateEnd="dateEnd"
        @setMap="map = $event"
      />
    </v-content>
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
      layers: mapLayers,
      map: {},
      dateBegin: '2018-07-25',
      dateEnd: '2018-07-28'
    }
  },
  watch: {
    map(val) {
      this.map = val
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

.navdrawer {
  height: 100%;
}

.v-list__tile__title,
.v-select__selection {
  font-size: 14px;
  -moz-osx-font-size: 14px;
  -webkit-font-size: 14px;
}
</style>
