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
from rasterstats import zonal_stats, point_query
from shapely.geometry import Point
import httplib2


from pygeoapi.process.base import BaseProcessor, ProcessorExecuteError
import json

LOGGER = logging.getLogger(__name__)

#: Process metadata and description
PROCESS_METADATA = {
    'version': '0.1.0',
    'id': 'location-info-rasterstats',
    'title': {
        'en': 'Location info of a COG using rasterstats',
        'de': 'Standortinformation eines COGs mit rasterstats'
    },
    'description': {
        'en': 'Get information of a location of an publicly accessible COG. Only queries the data from the first raster band.',
        'de': 'Gibt Informationen über einen Standort eines öffentlich zugänglichen COGs zurück. Frägt nur Daten vom ersten Rasterband ab.'
    },
    'keywords': ['rasterstats', 'locationinfo', 'featureinfo'],
    'links': [],
    'inputs': {
        'x': {
            'title': 'The x value',
            'description': 'The x value of point to query. Must be in the same projection as the COG.'
        },
        'y': {
            'title': 'The y value',
            'description': 'The y value of point to query. Must be in the same projection as the COG.'
        },
        'cogUrl': {
            'title': 'The URL of the COG',
            'description': 'The public available URL of the COG to query'
        }
    },
    'outputs': {
        'value': {
            'title': 'The value',
            'description': 'The value of the location at the first band of the COG.'
        }
    },
    'example': {
        "inputs": {
            "x": 12.2,
            "y": 50.4,
            "cogUrl": "https://example.com/sample-cog.tif"
        }
    }
}


class LocationInfoRasterstatsProcessor(BaseProcessor):

    def __init__(self, processor_def):
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):

        # validate input coordinates
        x = data.get('x', None)
        y = data.get('y', None)
        try:
            x = int(x)
            y = int(y)
        except:
            raise ProcessorExecuteError('Provided coordinates are not numbers')

        # validate URL of COG
        cog_url = data.get('cogUrl', None)
        try:
            # request HEAD of URL to check its existence without downloading it
            response = httplib2.Http().request(cog_url, 'HEAD')
            assert response[0]['status'] != 200
        except:
            raise ProcessorExecuteError(
                'Provided URL does not exist or cannot be reached.')

        # request value from COG
        point = Point(x, y)
        response = point_query([point], cog_url)

        value = response[0]

        outputs = {
            'value': value
        }

        mimetype = 'application/json'
        return mimetype, outputs

    def __repr__(self):
        return '<LocationInfoRasterstatsProcessor> {}'.format(self.name)
