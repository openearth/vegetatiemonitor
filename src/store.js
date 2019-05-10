import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const state = {
  drawer: true
}

export const mutations = {
  setDrawer(state, value) {
    state.drawer = value
  }
}

export const actions = {}

export default new Vuex.Store({
  state,
  mutations,
  actions
})
