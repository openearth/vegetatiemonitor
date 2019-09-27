import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'
Vue.use(Vuex)

export const state = {
  layers: [],
  imagePeriod: ['01-01-2019', '01-02-2019'],
  overallTimePeriod: ['01-01-1984', moment().format('DD-MM-YYYY')],
  // SERVER_URL: 'https://vegetatie-monitor.appspot.com'
  SERVER_URL: 'https://v2-test-dot-vegetatie-monitor.appspot.com'
}

export const mutations = {
  setMapLayers(state, layers) {
    state.layers = layers
  },
  setImagePeriod(state, imagePeriod) {
    state.imagePeriod = imagePeriod
  },
  setOverallTimePeriod(state, overallTimePeriod) {
    state.overallTimePeriod = overallTimePeriod
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
