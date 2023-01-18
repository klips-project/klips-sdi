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
from .algorithms.location_info import get_location_info_time
from .algorithms.util import (get_crs_from_cog,
                              reproject,
                              url_exists,
                              get_available_cog_file_names)
from datetime import datetime
from shapely.geometry import Point
from urllib.parse import urljoin

LOGGER = logging.getLogger(__name__)

PROCESS_METADATA = {
    'version': '0.1.0',
    'id': 'location-info-time-rasterstats',
    'title': {
        'en': 'Time-based location info of a COG using rasterstats',
        'de': 'Zeitbasierte Standortinformation eines COGs mit rasterstats'
    },
    'description': {
        'en': 'Get time-based information of a location of an publicly \
            accessible COG. Only queries the data from the first raster band.',
        'de': 'Fragt zeitbasierte Rasterwerte eines öffentlich zugänglichen \
            COGs basierend auf Input-Koordinaten ab.\
                 Dabei wird nur das erste Band abgefragt.'
    },
    'keywords': ['rasterstats', 'locationinfo', 'featureinfo'],
    'links': [],
    'inputs': {
        'x': {
            'title': 'X coordinate',
            'description': 'The x coordinate of point to query. \
                Must be in the same projection as the COG.',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 1,
            'maxOccurs': 1,
        },
        'y': {
            'title': 'Y coordinate',
            'description': 'The y coordinate of point to query. \
                Must be in the  same projection as the COG.',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 1,
            'maxOccurs': 1
        },
        'cogDirUrl': {
            'title': 'URL COG directory',
            'description': 'The public available URL of the COG directory to \
                query. The contents of the directory must be accessible via \
                    NGINX JSON autoindex',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 1,
            'maxOccurs': 1
        },
        'startTimeStamp': {
            'title': 'Start timestamp',
            'description': 'The start timestamp of the request provided as \
                ISO string, like: 2022-10-08T12:32:00Z',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 0,
            'maxOccurs': 1,
        },
        'endTimeStamp': {
            'title': 'End timestamp',
            'description': 'The end timestamp of the request provided as \
                ISO string, like: 2022-10-08T12:32:00Z',
            'schema': {
                'type': 'string'
            },
            'minOccurs': 0,
            'maxOccurs': 1,
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
        "values": {
            'title': 'location values per timestamp',
            'description': 'The location values per available timestamp',
            'schema': {
                'type': 'array'
            }
        }
    },
    'example': {
        "inputs": {
            "x": 4582606.6,
            "y": 3115558.3,
            "cogDirUrl": "http://localhost/cog/dresden/dresden_temperature/",
            "startTimeStamp": "2022-10-02T12:32:00Z",
            "endTimeStamp": "2022-10-08T12:32:00Z"
        }
    }
}


class LocationInfoTimeRasterstatsProcessor(BaseProcessor):  # noqa: D101

    def __init__(self, processor_def):  # noqa: D107
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):  # noqa: D102
        y = data.get('y')
        x = data.get('x')
        cog_dir_url = data.get('cogDirUrl')
        start_ts = data.get('startTimeStamp')
        end_ts = data.get('endTimeStamp')
        input_crs = data.get('crs')
        return_geojson = data.get('returnGeoJson')

        if not url_exists(cog_dir_url):
            raise Exception('Cannot access provided URL: {}'
                            .format(cog_dir_url))

        if start_ts:
            start_ts = start_ts.replace('Z', '+00:00')
            start_ts = datetime.fromisoformat(start_ts)

        if end_ts:
            end_ts = end_ts.replace('Z', '+00:00')
            end_ts = datetime.fromisoformat(end_ts)

        point = Point(x, y)
        if 'crs' in data:
            # get CRS from first COG of directory
            cog_list = get_available_cog_file_names(cog_dir_url)
            first_cog = urljoin(cog_dir_url, cog_list[0]['name'])
            cog_crs = get_crs_from_cog(first_cog)

            if isinstance(input_crs, str) and input_crs.startswith('EPSG:'):
                if input_crs != cog_crs:
                    point = reproject(point, input_crs, cog_crs)
                else:
                    # provided CRS by user is identical to COG
                    # no conversion needed
                    pass
            else:
                raise Exception(
                    'Provided CRS from user is not valid: {}'.format(input_crs)
                )

        results = get_location_info_time(
            cog_dir_url, point,  start_ts, end_ts)
        outputs = {
            'values': results
        }

        if return_geojson is True:
            geojson_feature = shapely.geometry.mapping(point)
            geojson_feature['properties'] = outputs
            mimetype = 'application/geo+json'
            return mimetype, geojson_feature
        else:
            mimetype = 'application/json'
            return mimetype, outputs

    def __repr__(self):  # noqa: D105
        return '<LocationInfoTimeRasterstatsProcessor> {}'.format(self.name)