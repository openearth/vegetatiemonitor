import { mutations } from '../../../src/store.js'

describe('setDrawer', () => {
  test('update state.drawer with new value in payload', () => {
    const state = {
      drawer: true
    }
    const newVal = false
    mutations.setDrawer(state, newVal)
    expect(state.drawer).toEqual(newVal)
  })

  test('update state.layers with new value in payload', () => {
    const state = {
      layers: []
    }
    const newVal = {
      foo: 'bar'
    }
    mutations.setMapLayers(state, newVal)
    expect(state.layers).toEqual(newVal)
  })

  test('update state.imagePeriod with new value in payload', () => {
    const state = {
      imagePeriod: ['01-01-2019', '01-02-2019']
    }
    const newVal = ['01-01-2018', '01-02-2018']
    mutations.setImagePeriod(state, newVal)
    expect(state.imagePeriod).toEqual(newVal)
  })

  test('update state.overallTimePeriod with new value in payload', () => {
    const state = {
      overallTimePeriod: ['01-01-2019', '01-02-2019']
    }
    const newVal = ['01-01-2018', '01-02-2018']
    mutations.setOverallTimePeriod(state, newVal)
    expect(state.overallTimePeriod).toEqual(newVal)
  })

  test('update state.maplayers, to be added with payload', () => {
    const state = {
      layers: []
    }
    const newVal = {
      foo: 'bar'
    }
    mutations.addMapLayers(state, newVal)
    expect(state.layers).toEqual([newVal])
    const newVal2 = {
      foo2: 'bar2'
    }
    mutations.addMapLayers(state, newVal2)
    expect(state.layers).toEqual([newVal, newVal2])
  })
})
