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
from pygeoapi.process.base import BaseProcessor
from .algorithms.zonal_stats import get_zonal_stats_time
from .algorithms.util import (
    url_exists,
    get_crs_from_cog,
    reproject,
    get_available_cog_file_names)
from urllib.parse import urljoin
from datetime import datetime
from shapely.geometry import shape


LOGGER = logging.getLogger(__name__)

#: Process metadata and description
PROCESS_METADATA = {
    'version': '0.1.0',
    'id': 'zonal-statistics-time-rasterstats',
    'title': {
        'en': 'Time-based zonal statistics of a COG using rasterstats',
        'de': 'Zeitbasierte zonale Statistiken einer COG-Datei mit Hilfe von rasterstats'
    },
    'description': {
        'en': 'Compute time-based zonal statistics of a subset of a public accessible COG. Only queries data of the first raster band.',
        'de': 'Berechnet zeitbasierte zonale Statistiken eines öffentlich zugänglichen COGs. Fragt nur Daten vom ersten Rasterband ab.'
    },
    'keywords': ['rasterstats', 'zonal statistics'],
    'links': [],
    'inputs': {
        'cogDirUrl': {
            'title': 'URL COG directory',
            'description': 'The public available URL of the COG directory to query. The contents of the directory must be accessible via NGINX JSON autoindex',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 1,
            'maxOccurs': 1
        },
        'startTimeStamp': {
            'title': 'Start timestamp',
            'description': 'The start timestamp of the request provided as ISO string, like: 2022-10-08T12:32:00Z',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 0,
            'maxOccurs': 1,
        },
        'endTimeStamp': {
            'title': 'End timestamp',
            'description': 'The end timestamp of the request provided as ISO string, like: 2022-10-08T12:32:00Z',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 0,
            'maxOccurs': 1,
        },
        'polygonGeojson': {
            'title': 'Polygon GeoJSON',
            'description': 'A polygon GeoJSON for which to compute zonal statistics of the COG',
            'minOccurs': 1,
            'maxOccurs': 1,
            'schema': {
                '$ref': 'http://schemas.opengis.net/ogcapi/features/part1/1.0/openapi/schemas/geometryGeoJSON.json'
            }
        },
        'statisticMethods': {
            'title': 'Statistical Methods',
            'description': 'The statistical methods to apply. Any out of:  [\'count\', \'min\', \'max\', \'mean\', \'sum\', \'std\', \'median\', \'majority\', \'minority\', \'unique\', \'range\', \'nodata\', \'nan\']',
            'maxOccurs': 1,
            'schema': {
                'type': 'Array'
            }
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
            "cogDirUrl": "http://nginx/cog/dresden/dresden_temperature/",
            "startTimeStamp": "2022-10-02T12:32:00Z",
            "endTimeStamp": "2022-10-08T12:32:00Z",
            "statisticMethods": [
                "count",
                "majority"
            ],
            "polygonGeojson": {
                "coordinates": [
                    [
                        [
                            4582923.56687590200454,
                            3117421.271846642717719
                        ],
                        [
                            4581124.431979617103934,
                            3115178.194573352113366
                        ],
                        [
                            4584278.759395182132721,
                            3114862.761831795331091
                        ],
                        [
                            4584278.759395182132721,
                            3114862.761831795331091
                        ],
                        [
                            4582923.56687590200454,
                            3117421.271846642717719
                        ]
                    ]
                ],
                "type": "Polygon"
            }
        }
    }
}


class ZonalStatisticsTimeRasterstatsProcessor(BaseProcessor):

    def __init__(self, processor_def):
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):

        cog_dir_url = data.get('cogDirUrl')
        start_ts = data.get('startTimeStamp')
        end_ts = data.get('endTimeStamp')
        input_crs = data.get('crs')

        polygon_geojson = data.get('polygonGeojson')
        statistic_methods = data.get('statisticMethods')
        # TODO: ensure polygon is not too large, otherwise process
        #       takes very long or even crashes

        if not url_exists(cog_dir_url):
            raise Exception('Cannot access provided URL: {}'
                            .format(cog_dir_url))
        if start_ts:
            start_ts = start_ts.replace('Z', '+00:00')
            start_ts = datetime.fromisoformat(start_ts)

        if end_ts:
            end_ts = end_ts.replace('Z', '+00:00')
            end_ts = datetime.fromisoformat(end_ts)

        result = None
        polygon = shape(polygon_geojson)

        if 'crs' in data:
            if isinstance(input_crs, str) and input_crs.startswith('EPSG:'):
                # get CRS from first COG of directory
                cog_list = get_available_cog_file_names(cog_dir_url)
                first_cog = urljoin(cog_dir_url, cog_list[0]['name'])
                cog_crs = get_crs_from_cog(first_cog)

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
            result = get_zonal_stats_time(
                cog_dir_url,
                polygon,
                start_ts=start_ts,
                end_ts=end_ts,
                statistic_methods=statistic_methods
            )
        else:
            result = get_zonal_stats_time(
                cog_dir_url,
                polygon,
                start_ts=start_ts,
                end_ts=end_ts,
            )

        outputs = {
            'values': result
        }

        mimetype = 'application/json'
        return mimetype, outputs

    def __repr__(self):
        return '<ZonalStatisticsTimeRasterstatsProcessor> {}'.format(self.name)
