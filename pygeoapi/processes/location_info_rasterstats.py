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
from .algorithms.location_info import get_location_info
from .algorithms.util import get_crs_from_cog, reproject
from shapely.geometry import Point

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
        'en': 'Get information of a location of an publicly \
            accessible COG. Only queries the data from the first raster band.',
        'de': 'Fragt Rasterwerte eines öffentlich zugänglichen COG basierend\
        auf Input-Koordinaten ab. Dabei wird nur das erste Band abgefragt.'
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
                Must be in the same projection as the COG.',
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
            'description': 'If a GeoJSON shall be returned, \
                including the provided the geometry.',
            'schema': {
                'type': 'boolean'
            },
            'minOccurs': 1,
            'maxOccurs': 1
        }
    },
    'outputs': {
        'value': {
            'title': 'location value',
            'description': 'The value of the location at the first band\
                 of the COG.',
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


class LocationInfoRasterstatsProcessor(BaseProcessor):  # noqa: D101

    def __init__(self, processor_def):  # noqa: D107

        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):  # noqa: D102
        y = data.get('y')
        x = data.get('x')
        cog_url = data.get('cogUrl')
        input_crs = data.get('crs')
        return_geojson = data.get('returnGeoJson')

        point = Point(x, y)

        if 'crs' in data:
            if isinstance(input_crs, str) and input_crs.startswith('EPSG:'):
                cog_crs = get_crs_from_cog(cog_url)

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

        value = get_location_info(cog_url, point)

        if return_geojson is True:
            geojson_feature = shapely.geometry.mapping(point)
            geojson_feature['properties'] = value[0]
            mimetype = 'application/geo+json'
            return mimetype, geojson_feature
        else:
            outputs = {
                'values': value
            }
            mimetype = 'application/json'
            return mimetype, outputs

    def __repr__(self):  # noqa: D105
        return '<LocationInfoRasterstatsProcessor> {}'.format(self.name)
