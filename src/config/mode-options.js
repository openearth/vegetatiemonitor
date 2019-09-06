const modes = [
  {
    name: 'Veld',
    mapLayersItems: ['Kaartlagen', 'Analyse', 'Colofon'],
    mapLayersNames: [
      'Lalala',
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
        mode: 'JAAR',
        type: 'video'
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
        mode: 'JAAR',
        type: 'video'
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
        mode: 'JAAR',
        type: 'video'
      },
      {
        mode: 'DAG',
        type: 'image'
      }
    ]
  }
]

export { modes }
