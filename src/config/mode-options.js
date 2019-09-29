import moment from 'moment'

const modes = [
  {
    name: 'Veld',
    mapLayersItems: ['Kaartlagen', 'Analyse', 'Colofon'],
    mapLayersNames: [
      'Kadaster',
      'Stroombanen',
      'Classificatie',
      'Classificatie vs Legger',
      'Vegetatielegger',
      'Satelliet beelden',
      'Luchtfoto'
    ],
    timeModes: [
      {
        name: "JAAR",
        format: "%Y",
        interval: "year",
        timing: "yearly",
        momentFormat: "YYYY",
        extent: [
          moment()
            .startOf("year")
            .subtract(1, "year"),
          moment().startOf("year")
        ],
        ticks: 2,
        showLanes: false,
        showPlayer: false,
        showSlider: false,
        showBackForward: false
      },
      {
        name: "DAG",
        format: "%d-%m-%Y",
        interval: "day",
        timing: "daily",
        momentFormat: "DD-MM-YYYY",
        extent: [
          moment()
            .startOf("day")
            .subtract(6, "weeks"),
          moment().startOf("day")
        ],
        ticks: 6,
        showLanes: false,
        showPlayer: false,
        showSlider: true,
        showBackForward: true
      }
    ]
  },
  {
    name: 'Verken',
    mapLayersItems: ['Kaartlagen', 'Analyse', 'Download', 'Colofon'],
    mapLayersNames: [
      'Kadaster',
      'Stroombanen',
      'Classificatie',
      'Classificatie vs Legger',
      'Vegetatielegger',
      'Satelliet beelden',
      'Luchtfoto'
    ],
    timeModes: [
      {
        name: "JAAR",
        format: "%Y",
        interval: "year",
        timing: "yearly",
        momentFormat: "YYYY",
        extent: [
          moment()
            .startOf("year")
            .subtract(19, "year"),
          moment()
            .startOf("year")
        ],
        ticks: 19,
        showLanes: true,
        showPlayer: true,
        showSlider: true,
        showBackForward: true
      },
      {
        name: "DAG",
        format: "%-m-%Y",
        interval: "day",
        timing: "daily",
        momentFormat: "DD-MM-YYYY",
        extent: [
          moment()
            .startOf("day")
            .subtract(1, "year"),
          moment().startOf("day")
        ],
        ticks: 12,
        showLanes: true,
        showPlayer: true,
        showSlider: true,
        showBackForward: true
      }
    ]
  },
  {
    name: 'Voorspel',
    mapLayersItems: ['Kaartlagen', 'Analyse', 'Download', 'Colofon'],
    mapLayersNames: [
      'Kadaster',
      'Stroombanen',
      'Classificatie',
      'Classificatie vs Legger',
      'Vegetatielegger',
      'Vegetatie (NDVI)',
      'Satelliet beelden',
      'Luchtfoto'
    ],
    timeModes: [
      {
        name: 'JAAR',
        type: 'video',
        format: '%Y',
        interval: 'year',
        intervalType: 'interval',
        timing: 'yearly',
        momentFormat: 'YYYY',
        extent: [
          moment()
            .startOf('year')
            .subtract(19, 'year'),
          moment().startOf('year')
        ],
        ticks: 19,
        showLanes: true,
        showPlayer: true,
        showSlider: true,
        showBackForward: true
      },
      {
        name: 'DAG',
        type: 'image',
        format: '%-m-%Y',
        interval: 'day',
        timing: 'daily',
        intervalType: 'instance',
        momentFormat: 'DD-MM-YYYY',
        extent: [
          moment()
            .startOf('day')
            .subtract(1, 'year'),
          moment().startOf('day')
        ],
        ticks: 12,
        showLanes: true,
        showPlayer: true,
        showSlider: true,
        showBackForward: true
      }
    ]
  }
]

export { modes }
