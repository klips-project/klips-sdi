# noqa: D100
from pygeoapi.process.base import BaseProcessor

from .algorithms.grass_algorithms import generate_zonal_stats

from .algorithms.util import (url_exists, get_crs_from_cog, reproject)

from shapely.geometry import shape, GeometryCollection, mapping

import logging

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
            "polygonGeoJson": {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "coordinates": [
                                [
                                    [
                                        13.7400130068375,
                                        51.05477224322459
                                    ],
                                    [
                                        13.7400130068375,
                                        51.05720345861707
                                    ],
                                    [
                                        13.736583726888085,
                                        51.05720345861707
                                    ],
                                    [
                                        13.736583726888085,
                                        51.05477224322459
                                    ],
                                    [
                                        13.7400130068375,
                                        51.05477224322459
                                    ]
                                ]
                            ],
                            "type": "Polygon"
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "coordinates": [
                                [
                                    [
                                        13.740371878140337,
                                        51.052090240167644
                                    ],
                                    [
                                        13.740371878140337,
                                        51.050811847043576
                                    ],
                                    [
                                        13.743043526473741,
                                        51.050811847043576
                                    ],
                                    [
                                        13.743043526473741,
                                        51.052090240167644
                                    ],
                                    [
                                        13.740371878140337,
                                        51.052090240167644
                                    ]
                                ]
                            ],
                            "type": "Polygon"
                        }
                    }
                ]
            }
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
        'polygonGeoJson': {
            'title': 'Polygon GeoJSON',
            'description': 'A polygon GeoJSON for which to compute zonal statistics of the COG',  # noqa: E501
            'minOccurs': 1,
            'maxOccurs': 1,
            'schema': {
                '$ref': 'http://schemas.opengis.net/ogcapi/features/part1/1.0/openapi/schemas/geometryGeoJSON.json'  # noqa: E501
            }
        },
        'inputCrs': {
            'title': 'Coordinate reference system',
            'description': 'The coordinate reference system (CRS) of the provided geometry. If not provided, CRS of COG is assumed',  # noqa: E501
            'schema': {
                'type': 'string'
            },
            'minOccurs': 1,
            'maxOccurs': 1
        },
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
        geoms = data.get('polygonGeoJson', None)
        mimetype = 'application/json'
        input_crs = data.get('inputCrs', None)
        cog_crs = "EPSG:4326"

        # validate URL of COG
        if not url_exists(cog_url):
            raise Exception(f'Cannot access provided URL: {cog_url}.')

        # create GeometryCollection
        features = geoms["features"]
        collection = GeometryCollection(
            [shape(feature["geometry"]).buffer(0) for feature in features]
        )

        if input_crs is not None:
            if isinstance(input_crs, str) and input_crs.startswith('EPSG:'):
                cog_crs = get_crs_from_cog(cog_url)

                if input_crs != cog_crs:
                    # reproject
                    collection = reproject(collection, input_crs, cog_crs)
                    # transform back to geojson
                    geoms = mapping(collection)
            else:
                raise Exception(
                    'Provided CRS from user is not valid: {}'.format(input_crs)
                )

        LOGGER.debug(f'Start to generate zonal stats for {cog_url}.')
        try:
            result = generate_zonal_stats(
                rastermap=cog_url,
                geometries=geoms,
                crs=cog_crs
            )
        except Exception as e:
            LOGGER.debug(f'Failed to generate zonal stats for {cog_url}.')
            LOGGER.debug(e)
            raise e

        LOGGER.debug(f'Successfully generated zonal stats for {cog_url}.')
        return mimetype, result

    def __repr__(self):  # noqa: D105
        return '<ZonalStatisticsGrassProcessor> {}'.format(self.name)
