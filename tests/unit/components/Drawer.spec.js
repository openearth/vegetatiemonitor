import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import Drawer from '../../../src/components/Drawer.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)
const router = new VueRouter({
  name: 'route'
})

describe('Drawer', () => {
  let store = new Vuex.Store({
    modules: {
      mutations: {
        setDrawer: jest.fn()
      }
    }
  })
  const wrapper = shallowMount(Drawer, { store, localVue, router })

  it('Has a navigation drawer', () => {
    expect(wrapper.contains('v-navigation-drawer')).toBe(true)
  })

  it('Navigation drawer transitionEnd triggers drawer to be open', () => {
    const navdrawer = wrapper.find('v-navigation-drawer')
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
