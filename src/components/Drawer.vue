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
      <map-layers
        id="menuOpen"
        v-show="menu === 'Kaartlagen' && menuOpen"
        v-bind:layers.sync="layers"
        @setLayer="$emit('setLayer', $event)"
        @setLayerOrder="$emit('setLayerOrder', $event)"
        v-bind:dateBegin.sync="dateBegin"
        v-bind:dateEnd.sync="dateEnd"
        :modes="modes"
        :map="map"
      />
      <analyse
        id="menuOpen"
        v-show="menu === 'Analyse' && menuOpen"
        :layers="layers"
        :map="map"
        v-bind:dateBegin.sync="dateBegin"
        v-bind:dateEnd.sync="dateEnd"
      />
      <download
        id="menuOpen"
        v-if="menu === 'Download' && menuOpen"
        :map="map"
        :layers="downloadableLayers"
        v-bind:dateBegin.sync="dateBegin"
        v-bind:dateEnd.sync="dateEnd"
      />
      <colofon id="menuOpen" v-if="menu === 'Colofon' && menuOpen" />
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
import MapLayers from './MapLayers.vue'
import Analyse from './Analyse.vue'
import Download from './Download.vue'
import Colofon from './Colofon.vue'

export default {
  props: {
    layers: {
      type: Array
    },
    drawerstate: {
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
    }
  },
  data() {
    return {
      menu: '',
      mini: true,
      right: null,
      menuOpen: false,
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
      handler() {
        this.$emit('openDrawer', this.menuOpen)
      }
    }
  },
  computed: {
    mapLayers: {
      get() {
        return this.layers
      },
      set(mapLayers) {
        this.$emit('update:layers', mapLayers)
      }
    },
    filteredItems() {
      const mapLayersItems = this.modes.find(
        mode => mode.name === this.$route.name
      ).mapLayersItems
      return this.items.filter(item => mapLayersItems.includes(item.title))
    },
    drawer: {
      get() {
        return this.drawerstate
      },
      set(drawerstate) {
        this.$emit('setDrawerstate', drawerstate)
      }
    },
    downloadableLayers() {
      return this.layers.filter(layer => layer.download)
    }
  },
  mounted() {
    window.onkeyup = event => {
      if (event.key === 'Escape') {
        this.menuOpen = false
        this.menu = ''
        this.mini = true
      }
    }
  },
  components: {
    MapLayers,
    Analyse,
    Download,
    Colofon
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
    },
    transitionEnd() {
      this.menuOpen = true
    }
  }
}
</script>

<style>
#menuOpen {
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
