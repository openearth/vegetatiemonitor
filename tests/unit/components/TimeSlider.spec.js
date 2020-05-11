import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import moment from 'moment'
import TimeSlider from '../../../src/components/TimeSlider.vue'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
localVue.use(Vuetify)

const $route = {
  name: 'Veld'
}

describe('TimeSlider', () => {
  const wrapper = shallowMount(TimeSlider, {
    localVue,
    mocks: {
      $route
    },
    propsData: {
      dates: [],
      step: moment(),
      timeModes: [{
          name: 'JAAR',
          format: '%Y',
          interval: 'year',
          extent: [moment('1984'), moment()]
        }]
    }
  })

  wrapper.vm.timeMode = {
      name: 'JAAR',
      format: '%Y',
      interval: 'year',
      extent: [moment('1984'), moment()]
    }


  it('Updates the x scale on xScaleUpdate', () => {
    const xscale = 'foo'
    wrapper.vm.xscale = xscale
    wrapper.vm.updateScale()
    expect(wrapper.vm.xScale).not.toBe('foo')
  })

  it('emits update timeslider on updateImages', () => {
    wrapper.vm.updateImages()
    expect(wrapper.emitted('update:timeslider')).toEqual([[{
      dragging: false,
      beginDate: moment().format('YYYY-MM-DD'),
      endDate: moment().add(1, wrapper.vm.timeMode.interval).format('YYYY-MM-DD'),
      timing: wrapper.vm.timeMode.name
    }]])
  })
})
