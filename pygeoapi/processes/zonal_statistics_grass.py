# noqa: D100
import logging

from pygeoapi.process.base import BaseProcessor

from .algorithms.grass_algorithms import generate_zonal_stats

LOGGER = logging.getLogger(__name__)

PROCESS_METADATA = {
    'version': '0.0.1',
    'id': 'zonal-statistics-grass',
    'title': {
        'en': 'Zonal statistics with GRASS',
        'de': 'Zonale Statistik mit GRASS'
    },
    'description': {
        'en': 'Calculates zonal statistics using the GRASS module r.univar.',
        'de': 'Berechnet zonale Statistiken mit dem GRASS module r.univar.'
    },
    'keywords': ['zonal', 'statistics', 'raster'],
    'links': [],
    'example': {
        "inputs": {
            "cogUrl": "http://localhost/ecostress_4326_cog.tif",
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
    },
    'inputs': {
        'cogUrl': {
            'title': 'cogUrl',
            'description': 'Input COG url',
            'minOccurs': 1,
            'maxOccurs': 'unbounded',
            'schema': {
                'type': 'string'
            }
        },
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
    }
}


class ZonalStatisticsGrassProcessor(BaseProcessor):  # noqa: D101

    def __init__(self, processor_def):  # noqa: D107
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):  # noqa: D102
        cog_url = data.get('cogUrl', None)
        geoms = data.get('inputGeometries', None)
        mimetype = 'application/json'

        result = generate_zonal_stats(rastermap=cog_url, geometries=geoms)

        return mimetype, result


    def __repr__(self):  # noqa: D105
        return '<ZonalStatisticsGrassProcessor> {}'.format(self.name)
