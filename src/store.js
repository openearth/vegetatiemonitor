import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const state = {
  drawer: true,
  layers: [],
  SERVER_URL: 'https://vegetatie-monitor.appspot.com'
}

export const mutations = {
  setDrawer(state, value) {
    state.drawer = value
  },
  setMapLayers(state, layers) {
    state.layers = layers
  },
  addMapLayers(state, layer) {
    state.layers.push(layer)
  }
}

export const actions = {}

export default new Vuex.Store({
  state,
  mutations,
  actions
})
