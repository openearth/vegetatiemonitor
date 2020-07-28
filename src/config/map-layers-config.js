// see: http://forum.step.esa.int/t/list-of-band-combinations-for-sentinel-2 (posted by albert)
const pseudoColors = [
  {
    name: 'Natural colors',
    vis: {
      bands: ['red', 'green', 'blue'],
      min: 0.05,
      max: [0.35, 0.35, 0.45],
      gamma: 1.4
    }
  },
  {
    name: 'False color infrared',
    vis: {
      bands: ['nir', 'red', 'green'],
      min: 0.05,
      max: 0.35,
      gamma: 1.4
    }
  },
  {
    name: 'False color urban',
    vis: {
      bands: ['swir2', 'swir', 'red'],
      min: 0.05,
      max: 0.35,
      gamma: 1.4
    }
  },
  {
    name: 'Agriculture',
    vis: {
      bands: ['swir', 'nir', 'blue'],
      min: 0.05,
      max: 0.35,
      gamma: 1.4
    }
  },
  {
    name: 'Healthy vegetation',
    vis: {
      bands: ['nir', 'swir', 'blue'],
      min: 0.05,
      max: 0.35,
      gamma: 1.4
    }
  },
  {
    name: 'Vegetation Analysis',
    vis: {
      bands: ['swir', 'nir', 'red'],
      min: 0.05,
      max: 0.35,
      gamma: 1.4
    }
  }
]

const mapLayers = [
  {
    name: 'Kadaster',
    icon: './images/legend-kadaster.png',
    opacity: 100,
    active: false,
    baseLayer: 'Kadaster',
    hoverFilter: 'Kadasterlijnen',
    selectFilter: 'KadasterSelect',
    selectProperty: 'ADMINPERCE',
    datatypes: ['landuse', 'legger'],
    activeLayerType: 'mapboxLayers',
    info:
      'Deze kaart toont de kadasterpercelen in het gebied en kan worden gebruikt om een analyse per perceel op uit te voeren.',
    mapboxLayers: [
      {
        id: 'Kadasterlijnen',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.5tu1qjtk'
        },
        layout: {
          visibility: 'none'
        },
        'source-layer': 'kadaster-vlakken-1i9erw',
        paint: {
          'line-color': {
            type: 'identity',
            property: 'stroke'
          },
          'line-width': 4
        },
        filter: ['==', 'ADMINPERCE', '']
      },
      {
        id: 'KadasterSelect',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.5tu1qjtk'
        },
        layout: {
          visibility: 'none'
        },
        'source-layer': 'kadaster-vlakken-1i9erw',
        paint: {
          'line-color': {
            type: 'identity',
            property: 'stroke'
          },
          'line-width': 4
        },
        filter: ['==', 'ADMINPERCE', '']
      },
      {
        id: 'Kadaster',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.5tu1qjtk'
        },
        layout: {
          visibility: 'none'
        },
        'source-layer': 'kadaster-vlakken-1i9erw',
        paint: {
          'fill-color': 'rgba(32, 32, 32, 0.3)',
          'fill-outline-color': 'rgba(0, 0, 0, 0.3)'
        }
      }
    ],
    tableProperties: [
      {
        name: 'Perceel nummer',
        key: 'ADMINPERCE'
      },
      {
        name: 'Gemeente',
        key: 'GEMEENTE'
      },
      {
        name: 'Grootte',
        key: 'GROOTTE'
      }
    ]
  },
  {
    name: 'Vegetatielegger',
    icon: './images/legend-legger.png',
    info:
      'De vegetatielegger toont welke vegetatie formeel op een gegeven locatie mag voorkomen.',
    opacity: 100,
    active: false,
    datatypes: ['landuse'],
    activeLayerType: 'mapboxLayers',
    type: 'group',
    legend: {
      colors: [
        '#a3e0ff',
        '#ff827e',
        '#eefad4',
        '#debdde',
        '#73bf73',
        '#d97a36',
        '#ffec80',
        '#f2d218',
        '#d9bb16',
        '#ff0000'
      ],
      labels: [
        'water',
        'bebouwd of verhard',
        'gras en akker',
        'riet en ruigte',
        'bos',
        'struweel',
        'mengklasse 90/10',
        'mengklasse 70/30',
        'mengklasse 50/50',
        'onbekend'
      ]
    },
    baseLayer: 'Vegetatielegger',
    hoverFilter: 'Vegetatielijnen',
    selectFilter: 'VegetatieSelect',
    selectProperty: 'OBJECTID',
    mapboxLayers: [
      {
        id: 'Vegetatielijnen',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.cl1igr1w'
        },
        'source-layer': 'vegetatievlakkencombo',
        paint: {
          'line-color': 'rgb(0, 128, 0)',
          'line-width': 2
        },
        filter: ['==', 'OBJECTID', '']
      },
      {
        id: 'VegetatieSelect',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.cl1igr1w'
        },
        'source-layer': 'vegetatievlakkencombo',
        paint: {
          'line-color': 'rgb(0, 128, 0)',
          'line-width': 2
        },
        filter: ['==', 'OBJECTID', '']
      },
      {
        id: 'Vegetatielegger',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.cl1igr1w'
        },
        layout: {
          visibility: 'none'
        },
        'source-layer': 'vegetatievlakkencombo',
        paint: {
          'fill-color': [
            'case',
            ['match', ['get', 'VLKLASSE'], ['Water'], true, false],
            'rgb(191, 239, 255)',
            ['match', ['get', 'VLKLASSE'], ['Verhard oppervlak'], true, false],
            'rgb(255, 129, 126)',
            ['match', ['get', 'VLKLASSE'], ['Gras en Akker'], true, false],
            'rgb(238, 250, 212)',
            ['match', ['get', 'VLKLASSE'], ['Riet en Ruigte'], true, false],
            'rgb(222, 189, 222)',
            ['match', ['get', 'VLKLASSE'], ['Bos'], true, false],
            'rgb(115, 191, 115)',
            ['match', ['get', 'VLKLASSE'], ['Struweel'], true, false],
            'rgb(217, 122, 54)',
            ['match', ['get', 'VLKLASSE'], ['90-10'], true, false],
            'rgb(255, 236, 128)',
            ['match', ['get', 'VLKLASSE'], ['70-30'], true, false],
            'rgb(242, 210, 24)',
            ['match', ['get', 'VLKLASSE'], ['50-50'], true, false],
            'rgb(217, 187, 22)',
            ['match', ['get', 'MENGKLASSE'], ['90-10'], true, false],
            'rgb(255, 236, 128)',
            ['match', ['get', 'MENGKLASSE'], ['70-30'], true, false],
            'rgb(242, 210, 24)',
            ['match', ['get', 'MENGKLASSE'], ['50-50'], true, false],
            'rgb(217, 187, 22)',
            ['match', ['get', 'VLKLASSE'], [' '], true, false],
            'rgba(255, 0, 0, 0.5)',
            ['match', ['get', 'VL_KLASSE'], ['Water'], true, false],
            'rgb(191, 239, 255)',
            ['match', ['get', 'VL_KLASSE'], ['Verhard oppervlak'], true, false],
            'rgb(255, 129, 126)',
            ['match', ['get', 'VL_KLASSE'], ['Gras en Akker'], true, false],
            'rgb(238, 250, 212)',
            ['match', ['get', 'VL_KLASSE'], ['Riet en Ruigte'], true, false],
            'rgb(222, 189, 222)',
            ['match', ['get', 'VL_KLASSE'], ['Bos'], true, false],
            'rgb(115, 191, 115)',
            ['match', ['get', 'VL_KLASSE'], ['Struweel'], true, false],
            'rgb(217, 122, 54)',
            ['match', ['get', 'VL_KLASSE'], ['90-10'], true, false],
            'rgb(255, 236, 128)',
            ['match', ['get', 'VL_KLASSE'], ['70-30'], true, false],
            'rgb(242, 210, 24)',
            ['match', ['get', 'VL_KLASSE'], ['50-50'], true, false],
            'rgb(217, 187, 22)',
            ['match', ['get', 'VLKLASSE'], ['90/10'], true, false],
            'rgb(255, 236, 128)',
            ['match', ['get', 'VLKLASSE'], ['70/30'], true, false],
            'rgb(242, 210, 24)',
            ['match', ['get', 'VLKLASSE'], ['50/50'], true, false],
            'rgb(217, 187, 22)',
            ['match', ['get', 'VL_KLASSE'], [' '], true, false],
            'rgba(255, 0, 0, 0.5)',
            'rgba(255, 0, 0, 0.5)'
          ]
        }
      }
    ],
    tableProperties: [
      {
        name: 'Vegetatieklasse',
        key: 'VL_KLASSE'
      },
      {
        name: 'Mengklasse',
        key: 'MENGKLASSE'
      },
      {
        name: 'Stroombaan',
        key: 'STROOMBAAN'
      }
    ]
  },
  {
    name: 'Stroombanen',
    icon: './images/legend-stroombaan.png',
    opacity: 100,
    active: false,
    info:
      'De stroombanenkaart toont de hoofdstroombanen tijdens hoog water over de uiterwaarden.',
    activeLayerType: 'mapboxLayers',
    mapboxLayers: [
      {
        id: 'Streamlines',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.4puwiyv9'
        },
        'source-layer': 'stroombaan-8ndp71',
        paint: {
          'fill-color': 'rgba(51, 163, 255, 0.2)',
          'fill-outline-color': 'rgba(51, 163, 255, 1)'
        },
        layout: {
          visibility: 'none'
        }
      }
    ]
  },

  {
    name: 'Classificatie vs Legger',
    icon: './images/legend-classified.png',
    info:
      'Deze kaart vergelijkt de huidige classificatie met de legger in een kleurenschaal van groen (vegetatie is gladder dan de toegestane klasse) naar rood (vegetatie is ruwer dan de toegestane klasse).',
    opacity: 100,
    active: false,
    customExtent: true,
    dataset: 'landuse-vs-legger',
    legendtable: 'difference',
    activeLayerType: 'mapboxLayers',
    imageLayers: [{}],
    mapboxLayers: [
      {
        id: 'classificatie-vs-legger-video',
        type: 'raster',
        layout: {
          visibility: 'none'
        },
        source: {
          type: 'video-tiled',
          tiles: [
            'https://storage.googleapis.com/vegetatiemonitor/classificatie-vs-legger-video/{z}/{x}/{y}.webm'
          ],
          tileSize: 256,
          durationSec: 1.8,
          dateBegin: '2000-01-01',
          dateEnd: '2020-01-01',
          maxzoom: 14,
          minzoom: 9,
          scheme: 'xyz',
          geometry: []
        }
      }
    ],
    download: true,
    vis: {},
    timeslider: true,
    dates: []
  },

  {
    name: 'Classificatie',
    icon: './images/legend-classified.png',
    info:
      'Deze kaart toont de classificatie van het gekozen enkele satellietbeeld of jaargemiddelde beeld.',
    download: true,
    opacity: 100,
    active: false,
    customExtent: true,
    dataset: 'landuse', // important! this argument is needed to call the service
    activeLayerType: 'mapboxLayers',
    legend: {
      colors: [
        '#bdeeff',
        '#ff817e',
        '#eefad4',
        '#debdde',
        '#73bf73',
        '#d97a36'
      ],
      labels: [
        'water',
        'bebouwd of verhard',
        'gras en akker',
        'riet en ruigte',
        'bos',
        'struweel'
      ]
    },
    mapboxLayers: [
      {
        id: 'classificatie-video',
        type: 'raster',
        paint: {
          'raster-opacity': 0
        },
        layout: {
          visibility: 'none'
        },
        source: {
          type: 'video-tiled',
          tiles: [
            'https://storage.googleapis.com/vegetatiemonitor/classificatie-video/{z}/{x}/{y}.webm'
          ],
          tileSize: 256,
          durationSec: 1.8,
          dateBegin: '2000-01-01',
          dateEnd: '2020-01-01',
          maxzoom: 14,
          minzoom: 9,
          scheme: 'xyz',
          geometry: []
        }
      }
    ],
    imageLayers: [{}],
    vis: {},
    timeslider: true,
    dates: []
  },
  {
    name: 'Vegetatie (NDVI)',
    icon: './images/legend-ndvi.png',
    info:
      'Deze kaart toont de groenwaarde van het betreffende satellietbeeld, uitgedrukt in de ‘Normalized Difference Vegetation Index’. Hoe groener de waarde, hoe groener de vegetatie.',
    opacity: 100,
    active: false,
    download: true,
    dataset: 'ndvi', // important! this argument is needed to call the service
    activeLayerType: 'mapboxLayers',
    legend: {
      colors: [
        '#000000',
        '#252525',
        '#525252',
        '#737373',
        '#969696',
        '#bdbdbd',
        '#d9d9d9',
        '#f0f0f0',
        '#ffffff',
        '#f7fcf5',
        '#e5f5e0',
        '#c7e9c0',
        '#a1d99b',
        '#74c476',
        '#41ab5d',
        '#238b45',
        '#006d2c',
        '#00441b'
      ],
      range: '-1 1'
    },
    mapboxLayers: [
      {
        id: 'ndvi-video',
        type: 'raster',
        layout: {
          visibility: 'none'
        },
        source: {
          type: 'video-tiled',
          tiles: [
            'https://storage.googleapis.com/vegetatiemonitor/ndvi-video/{z}/{x}/{y}.webm'
          ],
          tileSize: 512,
          durationSec: 1.8,
          dateBegin: '2000-01-01',
          dateEnd: '2020-01-01',
          maxzoom: 14,
          minzoom: 9,
          scheme: 'xyz',
          geometry: []
        }
      }
    ],
    imageLayers: [{}],
    vis: {},
    timeslider: true,
    dates: []
  },
  {
    name: 'Satelliet beelden',
    icon: './images/legend-rgb.png',
    info:
      'Deze kaart toont het gekozen satellietbeeld waarop geclassificeerd wordt.',
    download: true,
    opacity: 100,
    active: true,
    dataset: 'satellite', // important! this argument is needed to call the service
    activeLayerType: 'mapboxLayers',
    mapboxLayers: [
      {
        id: 'satellite-natural-video',
        type: 'raster',
        layout: {
          visibility: 'visible'
        },
        source: {
          type: 'video-tiled',
          tiles: [
            'https://storage.googleapis.com/vegetatiemonitor/satellite-natural-video/{z}/{x}/{y}.webm'
          ],
          tileSize: 512,
          durationSec: 1.8,
          dateBegin: '2000-01-01',
          dateEnd: '2020-01-01',
          maxzoom: 14,
          minzoom: 9,
          scheme: 'xyz',
          geometry: []
        }
      }
    ],
    imageLayers: [{}],
    vis: {
      bands: ['red', 'green', 'blue'],
      min: 0.05,
      max: [0.35, 0.35, 0.45],
      gamma: 1.4
    },
    timeslider: true,
    dates: []
  },
  {
    name: 'Luchtfoto',
    icon: './images/legend-rgb.png',
    info:
      'Deze kaart toont de meest recente luchtfoto voor visuele vergelijking met de classificatieresultaten.',
    download: false,
    opacity: 100,
    active: false,
    activeLayerType: 'mapboxLayers',
    mapboxLayers: [
      {
        id: 'Luchtfoto',
        type: 'raster',
        paint: {
          'raster-opacity': 0
        },
        layout: {
          visibility: 'none'
        },
        source: {
          type: 'raster',
          tiles: [
            'https://geodata.nationaalgeoregister.nl/luchtfoto/rgb/wms?SERVICE=WMS&&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=Actueel_ortho25&STYLES=default&CRS=EPSG%3A3857&WIDTH=256&HEIGHT=256&bbox={bbox-epsg-3857}'
          ],
          tilesize: 256
        }
      }
    ]
  }
]

export { mapLayers }
