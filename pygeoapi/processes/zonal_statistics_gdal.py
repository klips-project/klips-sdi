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
import subprocess

from pygeoapi.process.base import BaseProcessor, ProcessorExecuteError
import json

LOGGER = logging.getLogger(__name__)

#: Process metadata and description
PROCESS_METADATA = {
    'version': '0.1.0',
    'id': 'zonal-statistics-gdal',
    'title': {
        'en': 'Zonal statistics with GDAL'
    },
    'description': {
        'en': 'Takes a GeoJSON and computes zonal statistics of a demo raster file using GDAL.',
        'en': 'Berechnet einfache zonale Statistiken auf Basis einer Demo Rasterdatei mit Hilfe von GDAL.'
    },
    'keywords': ['gdal', 'zonal', 'statistics', 'raster'],
    'links': [],
    'inputs': {
        'inputGeometries': {
            'title': 'Input geometries',
            'description': 'Input zones encoded as GeoJSON geometries',
            'minOccurs': 1,
            'maxOccurs': 'unbounded',
            'schema': {
                '$ref': 'http://schemas.opengis.net/ogcapi/features/part1/1.0/openapi/schemas/geometryGeoJSON.json'
            }
        }
    },
    'outputs': {
        'statistics': {
            'title': 'Zonal statistics',
            'description': 'The zonal statistics',
            'schema': {
                'type': 'object',
                'contentMediaType': 'application/json'
            }
        }
    },
    'example': {
        "inputs": {
            "inputGeometries": [
                {
                    "value": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [
                                    13.740481048705242,
                                    51.07277038077021
                                ],
                                [
                                    13.731125503661298,
                                    51.069210848003564
                                ],
                                [
                                    13.743141800048015,
                                    51.06489589578095
                                ],
                                [
                                    13.740481048705242,
                                    51.07277038077021
                                ]
                            ]
                        ]
                    },
                    "mediaType": "application/geo+json"
                }
            ]
        }
    }
}


class ZonalStatisticsGdalProcessor(BaseProcessor):

    def __init__(self, processor_def):
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):

        mimetype = 'application/json'
        geom = data.get('inputGeometries', None)
        jsonString = json.dumps(geom[0]['value'])

        raw_output = subprocess.run(
            [
                '/process_scripts/zonal_stats.sh',
                jsonString
            ],
            capture_output=True
        ).stdout

        output = json.loads(raw_output)

        # strangely the stats are in a object with an empty string ("") as key
        stats = output['bands'][0]['metadata']['']

        outputs = stats

        return mimetype, outputs

    def __repr__(self):
        return '<ZonalStatisticsGdalProcessor> {}'.format(self.name)
