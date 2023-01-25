# noqa: D100
# =================================================================
#
# Authors: Tom Kralidis <tomkralidis@gmail.com>
#
# Copyright (c) 2019 Tom Kralidis
#
# Permission is hereby granted, free of charge, to any person
# obtaining a copy of this software and associated documentation
# files (the "Software"), to deal in the Software without
# restriction, including without limitation the rights to use,
# copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following
# conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
# OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
# WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
# OTHER DEALINGS IN THE SOFTWARE.
#
# =================================================================

import logging
import shapely
from pygeoapi.process.base import BaseProcessor
from .algorithms.zonal_stats import get_zonal_stats
from shapely.geometry import shape
from .algorithms.util import get_crs_from_cog, reproject

LOGGER = logging.getLogger(__name__)

#: Process metadata and description
PROCESS_METADATA = {
    'version': '0.1.0',
    'id': 'zonal-statistics-rasterstats',
    'title': {
        'en': 'Zonal statistics of a COG using rasterstats',
        'de': 'Zonale Statistiken einer COG-Datei mit Hilfe von rasterstas'
    },
    'description': {
        'en': 'Compute zonal statistics of a subset of a public accessible\
             COG. Only queries data of the first raster band.',
        'de': 'Berechnet zonale Statistiken eines öffentlich zugänglichen \
            COGs. Fragt nur Daten vom ersten Rasterband ab.'
    },
    'keywords': ['rasterstats', 'zonal statistics'],
    'links': [],
    'inputs': {
        'cogUrl': {
            'title': 'The URL of the COG',
            'description': 'The public available URL of the COG to query',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 1,
            'maxOccurs': 1,
        },
        'polygonGeoJson': {
            'title': 'Polygon GeoJSON',
            'description': 'A polygon GeoJSON for which to compute zonal \
                statistics of the COG',
            'minOccurs': 1,
            'maxOccurs': 1,
            'schema': {
                '$ref': 'http://schemas.opengis.net/ogcapi/features/part1/1.0/openapi/schemas/geometryGeoJSON.json'  # noqa
            }
        },
        'statisticMethods': {
            'title': 'Statistical Methods',
            'description': 'The statistical methods to apply. Any out of:  [\'count\', \'min\', \'max\', \'mean\', \'sum\', \'std\', \'median\', \'majority\', \'minority\', \'unique\', \'range\', \'nodata\', \'nan\']',  # noqa
            'maxOccurs': 1,
            'schema': {
                'type': 'Array'
            }
        },
        'inputCrs': {
            'title': 'Coordinate reference system',
            'description': 'The coordinate reference system of the \
                provided geometry',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 1,
            'maxOccurs': 1
        },
        'returnGeoJson': {
            'title': 'Return GeoJSON',
            'description': 'If a GeoJSON shall be returned,\
                 including the provided the geometry.',
            'schema': {
                'type': 'boolean'
            },
            'minOccurs': 1,
            'maxOccurs': 1
        }
    },
    'outputs': {
        'values': {
            'title': 'TODO',
            'description': 'TODO',
            'schema': {
                'type': 'string'
            }
        }
    },
    'example': {
        "inputs": {
            "cogUrl": "https://example.com/sample-cog.tif",
            "statisticMethods": ["count", "majority"],
            "polygonGeoJson": {
                "coordinates": [
                    [
                        [
                            7.398378066263234,
                            50.35623617599114
                        ],
                        [
                            7.398378066263234,
                            47.310703221840384
                        ],
                        [
                            14.007896257545866,
                            47.310703221840384
                        ],
                        [
                            14.007896257545866,
                            50.35623617599114
                        ],
                        [
                            7.398378066263234,
                            50.35623617599114
                        ]
                    ]
                ],
                "type": "Polygon"
            }
        }
    }
}


class ZonalStatisticsRasterstatsProcessor(BaseProcessor):  # noqa: D101

    def __init__(self, processor_def):  # noqa: D107
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):  # noqa: D102

        cog_url = data.get('cogUrl')
        polygon_geojson = data.get('polygonGeoJson')
        statistic_methods = data.get('statisticMethods')
        input_crs = data.get('crs')
        return_geojson = data.get('returnGeoJson')

        # TODO: ensure polygon is not too large,
        #       otherwise process takes very long or even crashes

        result = None
        polygon = shape(polygon_geojson)

        if 'crs' in data:
            if isinstance(input_crs, str) and input_crs.startswith('EPSG:'):
                cog_crs = get_crs_from_cog(cog_url)

                if input_crs != cog_crs:
                    polygon = reproject(polygon, input_crs, cog_crs)
                else:
                    # provided CRS by user is identical to COG
                    # no conversion needed
                    pass
            else:
                raise Exception(
                    'Provided CRS from user is not valid: {}'.format(input_crs)
                )

        if statistic_methods:
            result = get_zonal_stats(
                cog_url,
                polygon,
                statistic_methods=statistic_methods
            )
        else:
            result = get_zonal_stats(
                cog_url,
                polygon
            )

        if return_geojson is True:
            geojson_feature = shapely.geometry.mapping(polygon)
            geojson_feature['properties'] = result[0]
            mimetype = 'application/geo+json'
            return mimetype, geojson_feature
        else:
            mimetype = 'application/json'
            outputs = {
                'values': result
            }
            return mimetype, outputs

    def __repr__(self):  # noqa: D105
        return '<ZonalStatisticsRasterstatsProcessor> {}'.format(self.name)
