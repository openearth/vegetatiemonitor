in combine_leggers.ipynb you can add multiple leggers together and adding a start_date and end_date as property to the features. This notebook creates a geojson.

Before uploading to mapbox make mbtiles (because it is too big of a geojson).

example of running tippecanoe:

docker run -v d:/vegetatiemonitor/data/vegetatievlakken:/data openearth/tippecanoe ./tippecanoe /data/vegetatievlakken-combo.geojson -o /data/vegetatievlakken.mbtiles
