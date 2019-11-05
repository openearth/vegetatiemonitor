<template>
  <div class="viewer">
    <v-disclaimer></v-disclaimer>
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
        @setLayer="updateLayer($event)"
        @setLayerOrder="updateLayerOrder($event)"
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
        @setLayer="setLayer($event)"
        @setDateBegin="dateBegin = $event"
        @setDateEnd="dateEnd = $event"
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
      drawerstate: true,
      modes: modes,
      map: {},
      layers: mapLayers,
      dateBegin: '2018-07-25',
      dateEnd: '2018-07-28'
    }
  },
  watch: {
    map(val) {
      this.map = val
    },
    layers(val) {
      this.layers = val
    },
    dateBegin(val) {
      this.dateBegin = val
    },
    dateEnd(val) {
      this.dateEnd = val
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
