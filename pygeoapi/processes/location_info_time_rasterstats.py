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


from pygeoapi.process.base import BaseProcessor, ProcessorExecuteError
from .algorithms.location_info import get_location_info_time
from .algorithms.util import get_available_cog_file_names, url_exists
from datetime import datetime

LOGGER = logging.getLogger(__name__)

#: Process metadata and description
# TODO
PROCESS_METADATA = {
    'version': '0.1.0',
    'id': 'location-info-time-rasterstats',
    'title': {
        'en': 'TODO: Location info of a COG using rasterstats',
        'de': 'TODO: Standortinformation eines COGs mit rasterstats'
    },
    'description': {
        'en': 'TODO: Get information of a location of an publicly accessible COG. Only queries the data from the first raster band.',
        'de': 'TODO: Fragt Rasterwerte eines öffentlich zugänglichen COG basierend auf Input-Koordinaten ab. Dabei wird nur das erste Band abgefragt.'
    },
    'keywords': ['rasterstats', 'locationinfo', 'featureinfo'],
    'links': [],
    'inputs': {
        'x': {
            'title': 'X coordinate',
            'description': 'The x coordinate of point to query. Must be in the same projection as the COG.',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 1,
            'maxOccurs': 1,
        },
        'y': {
            'title': 'Y coordinate',
            'description': 'The y coordinate of point to query. Must be in the same projection as the COG.',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 1,
            'maxOccurs': 1
        },
        'cogUrl': {
            'title': 'URL of the COG',
            'description': 'The public available URL of the COG to query',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 1,
            'maxOccurs': 1
        }
    },
    'outputs': {
        'value': {
            'title': 'location value',
            'description': 'The value of the location at the first band of the COG.',
            'schema': {
                'type': 'string'
            }
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


class LocationInfoTimeRasterstatsProcessor(BaseProcessor):

    def __init__(self, processor_def):
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):

        y = data.get('y')
        x = data.get('x')
        cog_dir_url = data.get('cogDirUrl')
        start_ts = data.get('startTimeStamp')
        end_ts = data.get('endTimeStamp')

        if not url_exists(cog_dir_url):
            raise Exception('Cannot access provided URL: {}'
                            .format(cog_dir_url))

        # TODO: error handling
        if start_ts:
            start_ts = start_ts.replace('Z', '+00:00')
            start_ts = datetime.fromisoformat(start_ts)

        # TODO: error handling
        if end_ts:
            end_ts = end_ts.replace('Z', '+00:00')
            end_ts = datetime.fromisoformat(end_ts)

        cog_list = get_available_cog_file_names(cog_dir_url)
        LOGGER.error(cog_list)

        results = get_location_info_time(
            cog_dir_url, cog_list, x, y, start_ts, end_ts)

        mimetype = 'application/json'
        return mimetype, results

    def __repr__(self):
        return '<LocationInfoTimeRasterstatsProcessor> {}'.format(self.name)
