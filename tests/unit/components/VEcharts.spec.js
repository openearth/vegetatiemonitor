import {
  createLocalVue,
  mount
} from '@vue/test-utils'
import Vuex from 'vuex'
import VEcharts from '../../../src/components/VEcharts.vue'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuetify)

const $store = {
  state: {
    SERVER_URL: 'test'
  }
}

describe('VEcharts', () => {
  const fetch = jest.fn(() => Promise.resolve({
    json: jest.fn()
  }))
  global.fetch = fetch
  const wrapper = mount(VEcharts, {
    localVue,
    mocks: {
      $store
    },
    propsData: {
      datatype: 'legger',
      dateBegin: '16-08-1993',
      dateEnd: '01-01-2019',
      polygon: {},
      timeMode: {
        name: 'JAAR',
        format: '%Y',
        interval: 'year'
      }
    }
  })
  it('fetches data from the server on mounted ', () => {
    expect(fetch).toHaveBeenCalled()
  })
  it('shows an echarts canvas element when loading is done', () => {
    wrapper.vm.error = true
    expect(wrapper.contains('.progress')).toBe(true)
    expect(wrapper.contains('.chart')).toBe(true)
  })

  it('shows a circular progress element when loading', () => {
    wrapper.vm.loading = true
    wrapper.vm.error = false
    expect(wrapper.contains('.progress')).toBe(false)
    expect(wrapper.contains('.chart')).toBe(true)
  })

})
