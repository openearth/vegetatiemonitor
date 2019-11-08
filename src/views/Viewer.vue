<template>
  <div class="viewer">
    <v-disclaimer></v-disclaimer>
    <toolbar
      :drawerState.sync="drawerState"
      :modes="modes"
      id="toolbar-comp"
    />

    <v-content id="content">
      <drawer
        :drawerState.sync="drawerState"
        :layers="layers"
        :openDrawer.sync="openDrawer"
        @setLayer="updateLayer($event)"
        @setLayerOrder="updateLayerOrder($event)"
        :map="map"
        :dateBegin.sync="dateBegin"
        :dateEnd.sync="dateEnd"
        :timeMode.sync="timeMode"
        class="navdrawer"
        :modes="modes"
        :loadingLayers.sync="loadingLayers"
      />

      <map-component
        :openDrawer.sync="openDrawer"
        :layers.sync="layers"
        :map.sync="map"
        :dateBegin.sync="dateBegin"
        :dateEnd.sync="dateEnd"
        :modes="modes"
        :timeMode.sync="timeMode"
        :loadingLayers.sync="loadingLayers"
      />
    </v-content>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import MapComponent from '@/components/MapComponent'
import Drawer from '@/components/Drawer'
import VDisclaimer from '@/components/VDisclaimer'

import { mapLayers } from '../config/map-layers-config.js'
import { modes } from '../config/mode-options.js'

export default {
  name: 'viewer',
  data: function() {
    return {
      drawerState: true,
      modes: modes,
      map: {},
      layers: mapLayers,
      dateBegin: '2018-07-25',
      dateEnd: '2018-07-28',
      openDrawer: false,
      timeMode: {
        timing: 'yearly'
      },
      loadingLayers: []
    }
  },
  methods: {
    updateLayer(layer) {
      this.layers = this.layers.map(l => {
        if (l.name === layer.name) return layer
        else return l
      })
    },
    updateLayerOrder(layers) {
      const updatedLayerNames = layers.map(l => l.name)
      const hiddenLayers = this.layers.filter(
        l => !updatedLayerNames.includes(l.name)
      )
      hiddenLayers.forEach(layer => layers.push(layer))
      this.layers = layers
    }
  },
  components: {
    Toolbar,
    MapComponent,
    Drawer,
    VDisclaimer
  }
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
