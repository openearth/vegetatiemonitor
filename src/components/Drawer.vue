<template>
  <v-navigation-drawer
    id="navdrawer"
    v-model="drawer"
    @transitionend="transitionEnd()"
    :mini-variant="mini"
    mini-variant-width="48px"
    width="400px"
    absolute
    floating
    stateless
    fixed
    hide-overlay
    clipped
  >
    <v-layout fill-height>
      <v-navigation-drawer
        v-model="drawer"
        mini-variant
        stateless
        mini-variant-width="48px"
      >
        <v-list class="pt-0" dense>
          <v-list-item
            v-for="item in filteredItems"
            :key="item.title"
            v-on:click="menuButton(item.title)"
            :ripple="false"
          >
            <v-list-item-action>
              <v-icon class="ma-auto">{{ item.icon }}</v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-map-layers
        id="menu-open"
        v-show="menu === 'Kaartlagen' && menuOpen"
        @setLayer="$emit('setLayer', $event)"
        @setLayerOrder="$emit('setLayerOrder', $event)"
        :layers.sync="layers"
        :dateBegin.sync="dateBegin"
        :dateEnd.sync="dateEnd"
        :modes="modes"
        :map="map"
        :loadingLayers="loadingLayers"
        :timeMode.sync='timeMode'
      />
      <v-analyse
        id="menu-open"
        v-if="menu === 'Analyse' && menuOpen"
        :layers="analyseLayers"
        @setLayer="$emit('setLayer', $event)"
        :map="map"
        :dateBegin.sync="dateBegin"
        :dateEnd.sync="dateEnd"
        :timeMode.sync='timeMode'
      />
      <v-download
        id="menuOpen"
        v-if="menu === 'Download' && menuOpen"
        :map="map"
        :layers="downloadableLayers"
        :dateBegin.sync="dateBegin"
        :dateEnd.sync="dateEnd"
        :timeMode.sync='timeMode'
      />
      <v-colofon id="menuOpen" v-if="menu === 'Colofon' && menuOpen" />
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
import MapLayers from './MapLayers.vue'
import Analyse from './Analyse.vue'
import Download from './Download.vue'
import Colofon from './Colofon.vue'
import * as Cookies from 'tiny-cookie'

export default {
  props: {
    layers: {
      type: Array
    },
    drawerState: {
      type: Boolean
    },
    map: {
      type: Object
    },
    dateBegin: {
      type: String
    },
    dateEnd: {
      type: String
    },
    modes: {
      type: Array
    },
    timeMode: {
      type: Object
    },
    loadingLayers: {
      type: Array
    }
  },
  data() {
    return {
      menu: '',
      mini: true,
      right: null,
      menuOpen: true,
      items: [
        {
          icon: 'fa-layer-group',
          title: 'Kaartlagen'
        },
        {
          icon: 'fa-chart-pie',
          title: 'Analyse'
        },
        {
          icon: 'fa-download',
          title: 'Download'
        },
        {
          icon: 'fa-info',
          title: 'Colofon'
        }
      ]
    }
  },
  watch: {
    mini: {
      handler(val) {
        this.$emit('update:open-drawer', this.menuOpen)
      }
    }
  },
  computed: {
    drawer: {
      get() {
        return this.drawerState
      },
      set(drawerState) {
        this.$emit('update:drawer-state', drawerState)
      }
    },
    filteredItems() {
      const mapLayersItems = this.modes.find(
        mode => mode.name === this.$route.name
      ).mapLayersItems
      return this.items.filter(item => mapLayersItems.includes(item.title))
    },
    downloadableLayers() {
      const layerNames = this.modes.find(
        mode => mode.name === this.$route.name
      ).mapLayersNames

      const layers = this.layers.filter(layer =>
        layerNames.includes(layer.name)
      )
      return layers.filter(layer => layer.download)
    },
    analyseLayers() {
      return this.layers.filter(layer => layer.hoverFilter)
    }
  },
  mounted() {
    window.onkeyup = event => {
      if (event.key === 'Escape') {
        this.menuOpen = false
        this.$emit('update:open-drawer', this.menuOpen)
        this.menu = ''
        this.mini = true
      }
    }

    window.drawer = this

    // restore selected from a Cookie if available else start with the maplayers
    const menu = Cookies.get('drawer-menu')
    if(menu !== 'null') {
      this.menuButton(Cookies.get('drawer-menu'))
    } else {
      this.menuButton('Kaartlagen')
    }
    this.$emit('update:open-drawer', this.menuOpen)
  },
  components: {
    "v-map-layers": MapLayers,
    "v-analyse": Analyse,
    "v-download": Download,
    "v-colofon": Colofon
  },
  methods: {
    menuButton(title) {
      if (this.menu === title) {
        this.menu = ''
        this.mini = true
        this.menuOpen = false
      } else {
        this.menu = title
        this.mini = false
      }

      // save selected menu as a Cookie
      Cookies.set('drawer-menu', this.menu)
    },
    transitionEnd() {
      this.menuOpen = true
    }
  }
}
</script>

<style>
#menu-open {
  width: 90%;
  height: calc(100vh - 48px);
  overflow-y: hidden;
}

a.v-list__tile {
  padding: 0;
}

.v-riple__container {
  display: none;
}
</style>
