<template>
  <v-navigation-drawer
    v-model="drawer"
    class="navdrawer"
    floating
    :mini-variant="mini"
    hide-overlay
    fixed
    width="360px"
    @transitionend="transitionEnd()"
    mini-variant-width="48px"
  >
    <v-layout fill-height>
      <v-navigation-drawer
        hide-overlay
        v-model="drawer"
        mini-variant
        stateless
        mini-variant-width="48px"
      >
        <v-list class="pt-0" dense>
          <v-list-tile
            v-for="item in filteredItems"
            :key="item.title"
            v-on:click="menuButton(item.title)"
          >
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <map-layers
        id="menuOpen"
        v-if="menu === 'Kaartlagen' && menuOpen"
        :layers="layers"
        v-on:setLayers="mapLayers = $event"
      />
      <analyse id="menuOpen" v-if="menu === 'Analyse' && menuOpen" />
      <download id="menuOpen" v-if="menu === 'Download' && menuOpen" />
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
      type: Array,
      required: true
    },
    drawerstate: {
      type: Boolean
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
          title: 'Kaartlagen',
          routes: ['Veld', 'Verken', 'Voorspel']
        },
        {
          icon: 'fa-chart-pie',
          title: 'Analyse',
          routes: ['Veld', 'Verken', 'Voorspel']
        },
        {
          icon: 'fa-download',
          title: 'Download',
          routes: ['Verken', 'Voorspel']
        },
        {
          icon: 'fa-info',
          title: 'Colofon',
          routes: ['Veld', 'Verken', 'Voorspel']
        }
      ]
    }
  },
  computed: {
    mapLayers: {
      get() {
        return this.layers
      },
      set(mapLayers) {
        console.log('changing maplayers')
        this.$emit('setLayers', mapLayers)
      }
    },
    filteredItems() {
      return this.items.filter(item => item.routes.includes(this.$route.name))
    },
    drawer: {
      get() {
        return this.drawerstate
      },
      set(drawerstate) {
        this.$emit('setDrawerstate', drawerstate)
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
.navdrawer {
  top: 48px;
  margin: 0;
}

#menuOpen {
  width: 90%;
  height: calc(100vh - 48px);
}

a.v-list__tile {
  padding: 0;
}
</style>
