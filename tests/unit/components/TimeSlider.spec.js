import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import moment from 'moment'
import TimeSlider from '../../../src/components/TimeSlider.vue'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)
localVue.use(Vuetify)
const router = new VueRouter({
  name: 'route'
})

describe('TimeSlider', () => {
  const wrapper = shallowMount(TimeSlider, {
    localVue,
    router,
    propsData: {
      layers: []
    }
  })

  wrapper.vm.mode = {
    name: 'JAAR',
    format: '%Y',
    interval: 'year',
    extent: [moment('1984'), moment()]
  }

  it('Updates the x scale on xScaleUpdate', () => {
    const xscale = 'foo'
    wrapper.vm.xscale = xscale
    wrapper.vm.mode = {
      extent: [moment('2018'), moment()]
    }
    wrapper.vm.updateScale()
    expect(wrapper.vm.xScale).not.toBe('foo')
  })

  it('emits update timeslider when step is changed', () => {
    const step = '01-01-2000'
    wrapper.vm.step = step
    expect(wrapper.emitted('update-timeslider')).toEqual([
      [[moment(step), moment(step).add(1, wrapper.vm.mode.interval)]]
    ])
  })
})
