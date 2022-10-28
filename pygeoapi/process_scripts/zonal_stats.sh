#!/bin/bash

# Script to compute zonal statistics of a raster file cropped by an provided GeoJSON polygon.
# Usage: zonal_stats.sh "$(<demo.geojson)" /vsicurl/http://localhost/ecostress_4326_cog.tif
# Inputs: - The content of a GeoJSON polygon
#         - The GDAL GeoTIFF path, can also be a COG URL starting with "/vsicurl/"
# Returns: An JSON to standard out with 'max', 'mean', 'min', 'stddev', 'valid percent'

# hide warnings see https://gis.stackexchange.com/a/358593
export CPL_LOG=/dev/null

IN_GEOJSON_CONTENT="${1}"
IN_GEOTIFF_PATH="${2}"

echo "${IN_GEOJSON_CONTENT}" |
  gdalwarp \
    -cutline /vsistdin/ \
    -crop_to_cutline "${IN_GEOTIFF_PATH}" \
    /vsistdout/ |
  gdalinfo \
    -json \
    -stats \
    /vsistdin/
