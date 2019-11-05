import { state } from '../../../src/store.js'
import moment from 'moment'

describe('state', () => {
  test('Initial state', () => {
    const initialState = {
      layers: [],
      imagePeriod: ['01-01-2019', '01-02-2019'],
      overallTimePeriod: ['01-01-1984', moment().format('DD-MM-YYYY')],
      SERVER_URL: 'https://vegetatie-monitor.appspot.com'
    }
    expect(state).toEqual(initialState)
  })
})
