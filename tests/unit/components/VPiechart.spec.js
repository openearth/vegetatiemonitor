import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import VPiechart from '../../../src/components/VPiechart.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)
const router = new VueRouter({
  name: 'route'
})

describe('VPiechart', () => {
  const fetch = jest.fn(() => Promise.resolve({ json: jest.fn() }))
  global.fetch = fetch
  const wrapper = shallowMount(VPiechart, {
    localVue,
    router,
    propsData: {
      datatype: 'legger',
      dateBegin: '16-08-1993',
      dateEnd: '01-01-2019',
      polygon: []
    }
  })

  it('fetches data from the server on mounted ', () => {
    expect(fetch).toHaveBeenCalled()
  })

  it('shows a circular progress element when loading', () => {
    wrapper.vm.loading = true
    expect(wrapper.contains('v-progress-circular')).toBe(true)
    expect(wrapper.contains('.echarts')).toBe(false)
  })

  it('shows an echarts canvas element when loading is done', () => {
    wrapper.vm.loading = false
    expect(wrapper.contains('v-progress-circular')).toBe(false)
    expect(wrapper.contains('.echarts')).toBe(true)
  })
})
