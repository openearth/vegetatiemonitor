import { state } from '../../../src/store.js'

describe('state', () => {
  test('Initial state', () => {
    const initialState = {
      drawer: true,
      layers: [],
      SERVER_URL: 'https://vegetatie-monitor.appspot.com'
    }
    expect(state).toEqual(initialState)
  })
})
