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
})
