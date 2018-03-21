const mapLayers = [{
    layertype: 'gee-layer',
    name: 'Classificatie',
    icon: 'static/images/legend-classified.png',
    opacity: 100,
    active: false,
    dataset: 'landuse', // important! this argument is needed to call the service
    data: [],
    vis: {}
  },
  {
    layertype: 'mapbox-layer',
    name: 'Kadaster',
    icon: 'static/images/legend-kadaster.png',
    opacity: 100,
    active: false,
    data: [{
      id: 'Kadaster',
      type: 'fill',
      source: {
        type: 'vector',
        url: 'mapbox://ellispenning.5tu1qjtk',
      },
      'source-layer': 'kadaster-vlakken-1i9erw',
      paint: {
        'fill-color': 'rgba(32, 32, 32, 0.3)',
        'fill-outline-color': 'rgba(0, 0, 0, 0.3)'
      }
    }]

  },

  {
    layertype: 'mapbox-layer',
    name: 'Stroombanen',
    icon: 'static/images/legend-stroombaan.png',
    opacity: 100,
    active: true,
    data: [{
      id: 'Streamlines',
      type: 'fill',
      source: {
        type: 'vector',
        url: 'mapbox://ellispenning.4puwiyv9',
      },
      'source-layer': 'stroombaan-8ndp71',
      paint: {
        'fill-color': 'rgba(51, 163, 255, 0.2)',
        'fill-outline-color': 'rgba(51, 163, 255, 1)'
      }
    }]
  },

  {
    layertype: 'mapbox-layer',
    name: 'Vegetatielegger',
    icon: 'static/images/legend-legger.png',
    opacity: 100,
    active: true,
    type: "group",
    data: [{
        id: 'Vegetatielegger',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.87a2u39q',
        },
        'source-layer': 'vegetatie-vlakken-596nr3',
        paint: {
          'fill-color': {
            "base": 1,
            "type": "categorical",
            "property": "KLASSE",
            "stops": [
              [
                "Water",
                "rgba(191, 239, 255, 255)"
              ],
              [
                "Verhard oppervlak",
                "rgb(255, 129, 126)"
              ],
              [
                "Gras en Akker",
                "rgb(238, 250, 212)"
              ],
              [
                "Riet en Ruigte",
                "rgb(222, 189, 222)"
              ],
              [
                "Bos",
                "rgb(115, 191, 115)"
              ],
              [
                "Struweel",
                "rgb(217, 122, 54)"
              ],
              [
                "90-10",
                "rgb(255, 236, 128)"
              ],
              [
                "70-30",
                "rgb(242, 210, 24)"
              ],
              [
                "50-50",
                "rgb(217, 187, 22)"
              ]
            ],
            "default": "rgba(0, 0, 0, 0)"
          }
        },
      },
      {
        id: 'Beheersgrenzen',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://ellispenning.dbeqewih',
        },
        'source-layer': 'beheergrens-8l9whd',
        paint: {
          'line-color': 'rgb(80,155,255)'
        }
      }
    ]
  },
  {
    layertype: 'gee-layer',
    name: 'Vegetatie (NDVI)',
    icon: 'static/images/legend-ndvi.png',
    opacity: 100,
    active: false,
    dataset: 'ndvi', // important! this argument is needed to call the service
    colors: ['#000000', '#252525', '#525252', '#737373', '#969696', '#bdbdbd',
             '#d9d9d9', '#f0f0f0', '#ffffff', '#f7fcf5', '#e5f5e0', '#c7e9c0',
             '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
    range: '-1 1',
    data: [],
    vis: {}
  },
  {
    layertype: 'gee-layer',
    name: 'Satelliet beelden',
    icon: 'static/images/legend-rgb.png',
    opacity: 100,
    active: false,
    dataset: 'satellite', // important! this argument is needed to call the service
    data: [],
    vis: {
      bands: ["red", "green", "blue"],
      min: 0.05,
      max: 0.35,
      gamma: 2.0
    }
  },
]

export {
  mapLayers
}
