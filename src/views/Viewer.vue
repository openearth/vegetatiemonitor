<template>
  <div class="viewer">
    <toolbar
      :drawerstate="drawerstate"
      @setDrawerstate="drawerstate = $event"
      :modes="modes"
      id="toolbar-comp"
    />

    <v-content id="content">
      <drawer
        :drawerstate="drawerstate"
        :layers="layers"
        @setDrawerstate="drawerstate = $event"
        @setLayers="layers = $event"
        :map="map"
        :dateBegin="dateBegin"
        :dateEnd="dateEnd"
        class="navdrawer"
        :modes="modes"
      />

      <map-component
        :layers="layers"
        :map="map"
        :dateBegin="dateBegin"
        :dateEnd="dateEnd"
        :modes="modes"
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
import { modes } from '../config/mode-options.js'

export default {
  name: 'viewer',
  data: function() {
    return {
      drawerstate: true,
      layers: mapLayers,
      modes: modes,
      map: {},
      dateBegin: '2018-07-25',
      dateEnd: '2018-07-28'
    }
  },
  // created() {
  //   this.layers = mapLayers
  //   this.modes = modes
  // },
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
