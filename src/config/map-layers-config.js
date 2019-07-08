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
    layertype: 'mapbox-layer',
    name: 'Kadaster',
    icon: './images/legend-kadaster.png',
    opacity: 100,
    active: false,
    hoverFilter: 'Kadasterlijnen',
    selectFilter: 'KadasterSelect',
    selectProperty: 'ADMINPERCE',
    info:
      'Dit is een superduper awesome laag. Ik heb even opvulling nodig voor het informatie stukje bladiebladieblad',
    data: [
      {
        id: 'Kadaster',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.5tu1qjtk'
        },
        'source-layer': 'kadaster-vlakken-1i9erw',
        paint: {
          'fill-color': 'rgba(32, 32, 32, 0.3)',
          'fill-outline-color': 'rgba(0, 0, 0, 0.3)'
        }
      },
      {
        id: 'Kadasterlijnen',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.5tu1qjtk'
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
        'source-layer': 'kadaster-vlakken-1i9erw',
        paint: {
          'line-color': {
            type: 'identity',
            property: 'stroke'
          },
          'line-width': 4
        },
        filter: ['==', 'ADMINPERCE', '']
      }
    ],
    tableproperties: [
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
    layertype: 'mapbox-layer',
    name: 'Stroombanen',
    icon: './images/legend-stroombaan.png',
    opacity: 100,
    active: true,
    data: [
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
        }
      }
    ]
  },

  {
    layertype: 'gee-layer',
    name: 'Classificatie vs Legger',
    icon: './images/legend-classified.png',
    opacity: 100,
    active: false,
    dataset: 'landuse-vs-legger',
    legendtable: 'difference',
    data: [],
    vis: {},
    timeslider: true,
    dates: [
      {
        id: 'image-1',
        type: 'interval',
        start: '01-01-2010',
        end: '01-01-2011'
      },
      {
        id: 'image-1',
        type: 'interval',
        start: '01-01-2011',
        end: '01-01-2012'
      },
      {
        id: 'image-1',
        type: 'instance',
        time: '01-01-2006'
      },
      {
        id: 'image-1',
        type: 'instance',
        time: '01-01-2007'
      },
      {
        id: 'image-1',
        type: 'instance',
        time: '01-01-2008'
      },
      {
        id: 'image-1',
        type: 'instance',
        time: '01-01-2018'
      },
      {
        id: 'image-1',
        type: 'instance',
        time: '01-05-2019'
      }
    ]
  },

  {
    layertype: 'gee-layer',
    name: 'Classificatie',
    icon: './images/legend-classified.png',
    download: true,
    opacity: 100,
    active: true,
    dataset: 'landuse', // important! this argument is needed to call the service
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
    data: [],
    vis: {},
    timeslider: true,
    dates: []
  },

  {
    layertype: 'mapbox-layer',
    name: 'Vegetatielegger',
    icon: './images/legend-legger.png',
    opacity: 100,
    active: true,
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
        '#d9bb16'
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
        'mengklasse 50/50'
      ]
    },
    hoverFilter: 'Vegetatielijnen',
    selectFilter: 'VegetatieSelect',
    selectProperty: 'OBJECTID',
    data: [
      {
        id: 'Vegetatielegger',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.87a2u39q'
        },
        'source-layer': 'vegetatie-vlakken-596nr3',
        paint: {
          'fill-color': {
            base: 1,
            type: 'categorical',
            property: 'KLASSE',
            stops: [
              ['Water', 'rgba(191, 239, 255, 255)'],
              ['Verhard oppervlak', 'rgb(255, 129, 126)'],
              ['Gras en Akker', 'rgb(238, 250, 212)'],
              ['Riet en Ruigte', 'rgb(222, 189, 222)'],
              ['Bos', 'rgb(115, 191, 115)'],
              ['Struweel', 'rgb(217, 122, 54)'],
              ['90-10', 'rgb(255, 236, 128)'],
              ['70-30', 'rgb(242, 210, 24)'],
              ['50-50', 'rgb(217, 187, 22)']
            ],
            default: 'rgba(0, 0, 0, 0)'
          }
        }
      },
      {
        id: 'Vegetatielijnen',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.87a2u39q'
        },
        'source-layer': 'vegetatie-vlakken-596nr3',
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
          url: 'mapbox://ellispenning.87a2u39q'
        },
        'source-layer': 'vegetatie-vlakken-596nr3',
        paint: {
          'line-color': 'rgb(0, 128, 0)',
          'line-width': 2
        },
        filter: ['==', 'OBJECTID', '']
      }
    ],
    tableproperties: [
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
    layertype: 'gee-layer',
    name: 'Vegetatie (NDVI)',
    icon: './images/legend-ndvi.png',
    opacity: 100,
    active: false,
    download: true,
    dataset: 'ndvi', // important! this argument is needed to call the service
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
    data: [],
    vis: {}
  },
  {
    layertype: 'gee-layer',
    name: 'Satelliet beelden',
    icon: './images/legend-rgb.png',
    download: true,
    opacity: 100,
    active: false,
    dataset: 'satellite', // important! this argument is needed to call the service
    data: [],
    vis: pseudoColors[0].vis,
    settings: [
      {
        type: 'select',
        items: pseudoColors,
        selected: 'Natural colors'
      }
    ],
    timeslider: true,
    dates: [
      {
        id: 'image-1',
        type: 'interval',
        start: '01-01-2010',
        end: '01-01-2015'
      },
      {
        id: 'image-1',
        type: 'instance',
        time: '01-01-2006'
      },
      {
        id: 'image-1',
        type: 'instance',
        time: '01-01-2007'
      },
      {
        id: 'image-1',
        type: 'instance',
        time: '01-01-2008'
      },
      {
        id: 'image-1',
        type: 'instance',
        time: '01-01-2018'
      },
      {
        id: 'image-1',
        type: 'instance',
        time: '01-05-2019'
      }
    ]
  }
]

export { mapLayers }
