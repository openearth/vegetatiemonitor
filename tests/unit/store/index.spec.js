import { state } from '../../../src/store.js'

describe('state', () => {
  test('Initial state', () => {
    const initialState = {
      drawer: true
    }
    expect(state).toEqual(initialState)
  })
})
