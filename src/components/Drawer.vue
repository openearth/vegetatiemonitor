<template>
  <v-navigation-drawer
    v-model="$store.state.drawer"
    class="navdrawer"
    floating
    :mini-variant="mini"
    hide-overlay
    fixed
    width="400px"
    @transitionend="transitionend()"
  >
    <v-layout fill-height>
      <v-navigation-drawer
        hide-overlay
        v-model="$store.state.drawer"
        mini-variant
        stateless
      >
        <v-list class="pt-0" dense>
          <v-list-tile
            v-for="item in items"
            :key="item.title"
            v-on:click="clicking(item.title)"
          >
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <map-layers v-if="menu === 'Kaartlagen' && menuOpen" />
      <analyse v-if="menu === 'Analyse' && menuOpen" />
      <download v-if="menu === 'Download' && menuOpen" />
      <colofon v-if="menu === 'Colofon' && menuOpen" />
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
import MapLayers from './MapLayers.vue'
import Analyse from './Analyse.vue'
import Download from './Download.vue'
import Colofon from './Colofon.vue'

export default {
  data() {
    return {
      drawer: true,
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
  components: {
    MapLayers,
    Analyse,
    Download,
    Colofon
  },
  methods: {
    clicking(title) {
      if (this.menu === title) {
        this.menu = ''
        this.mini = true
      } else {
        this.menu = title
        this.mini = false
      }
      console.log('clicking', this.menu, title, this.mini)
    },
    transitionend() {
      console.log('transitioning')
      this.menuOpen = !this.menuOpen
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
  width: 100%;
}
</style>
