import logging

from pygeoapi.process.base import BaseProcessor, ProcessorExecuteError


LOGGER = logging.getLogger(__name__)

PROCESS_METADATA = {
    'version': '0.0.1',
    'id': 'zonal-statistics',
    'title': {
        'en': 'Zonal statistics',
        'de': 'Zonale Statistik'
    },
    'description': {
        'en': 'Calculates zonal statistics',
        'de': 'Berechnet eine zonale Statisik'
    },
    'keywords': ['zonal', 'statistics', 'raster'],
    'links': [],
    'example': [],
    'inputs': {
        'inputPolygons': {
            'title': 'Input polygons',
            'description': 'Input zones encoded as GeoJSON MultiPolygon',
            'minOccurs': 1,
            'maxOccurs': 1,
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
    }
}

class ZonalStatisticsProcessor(BaseProcessor):

    def __init__(self, processor_def):
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):
        json = data.get('inputPolygons', None)
        mimetype = 'application/json'

        if json is None:
            raise ProcessorExecuteError('Cannot process without input zones')

        outputs = {
            'id': 'statistics',
            'value': {
                'id': 'test'
            }
        }

        return mimetype, outputs

    def __repr__(self):
        return '<ZonalStatisticsProcessor> {}'.format(self.name)
