const modes = [
  {
    name: 'Veld',
    mapLayersItems: ['Kaartlagen', 'Analyse', 'Colofon'],
    mapLayersNames: [
      'Kadaster',
      'Stroombanen',
      'Classificatie',
      'Classificatie vs Legger',
      'VegetatieLegger',
      'Satelliet beelden'
    ],
    timeModes: [
      {
        mode: 'JAAR',
        type: 'image'
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
      'VegetatieLegger',
      'Satelliet beelden'
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
      'VegetatieLegger',
      'Vegetatie (NDVI)',
      'Satelliet beelden'
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
