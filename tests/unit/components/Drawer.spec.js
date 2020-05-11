import {
  createLocalVue,
  shallowMount
} from '@vue/test-utils'
import Vuex from 'vuex'
import Vuetify from 'vuetify'

import Drawer from '../../../src/components/Drawer.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuetify)
const $route = {
  name: 'Veld'
}

describe('Drawer', () => {
  const wrapper = shallowMount(Drawer, {
    localVue,
    mocks: {
      $route
    },
    propsData: {
      layers: [],
      drawerState: true,
      dateBegin: "01-01-2020",
      dateEnd: '01-02-2020',
      modes: [{
        name: 'Veld',
        mapLayersItems: ['Kaartlagen', 'Analyse', 'Colofon'],
        mapLayersNames: [
          'Kadaster',
          'Stroombanen']
      }],
      timeMode: {},
      loadingLayers: []
    }
  })

  it('Has a navigation drawer', () => {
    expect(wrapper.contains('#navdrawer')).toBe(true)
  })

  it('Navigation drawer transitionEnd triggers drawer to be open', () => {
    const navdrawer = wrapper.find('#navdrawer')
    navdrawer.trigger('transitionend')
    expect(wrapper.vm.menuOpen).toBe(true)
  })

  it('Changes menu state depending on call of menuButton', () => {
    wrapper.vm.menuButton('foo')
    expect(wrapper.vm.menu).toBe('foo')
    expect(wrapper.vm.mini).toBe(false)
    wrapper.vm.menuButton('foo')
    expect(wrapper.vm.menu).toBe('')
    expect(wrapper.vm.mini).toBe(true)
    expect(wrapper.vm.menuOpen).toBe(false)
    wrapper.vm.menuButton('bar')
    expect(wrapper.vm.menu).toBe('bar')
    expect(wrapper.vm.mini).toBe(false)
  })
})
