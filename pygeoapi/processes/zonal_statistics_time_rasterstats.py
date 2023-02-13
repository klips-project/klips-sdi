# noqa: D100
import logging
import shapely
from pygeoapi.process.base import BaseProcessor
from .algorithms.rasterstats_algorithms import get_zonal_stats_time
from .algorithms.util import (
    url_exists,
    get_crs_from_cog,
    reproject,
    get_available_cog_file_objects)
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
        'de': 'Zeitbasierte zonale Statistiken einer COG-Datei mit Hilfe von rasterstats'  # noqa: E501
    },
    'description': {
        'en': 'Compute time-based zonal statistics of a subset of a public accessible COG. Only queries data of the first raster band.',  # noqa: E501
        'de': 'Berechnet zeitbasierte zonale Statistiken eines öffentlich zugänglichen COGs. Fragt nur Daten vom ersten Rasterband ab.'  # noqa: E501
    },
    'keywords': ['rasterstats', 'zonal statistics'],
    'links': [],
    'inputs': {
        'cogDirUrl': {
            'title': 'URL COG directory',
            'description': 'The public available URL of the COG directory to query. The contents of the directory must be accessible via NGINX JSON autoindex. It only accepts GeoTIFFs with a filename like "dresden_20221101T1000Z.tif"',  # noqa: E501
            'schema': {
                'type': 'string'
            },
            'minOccurs': 1,
            'maxOccurs': 1
        },
        'startTimeStamp': {
            'title': 'Start timestamp',
            'description': 'The start timestamp of the request provided as ISO string, like: 2022-10-08T12:32:00Z',  # noqa: E501
            'schema': {
                'type': 'string'
            },
            'minOccurs': 0,
            'maxOccurs': 1,
        },
        'endTimeStamp': {
            'title': 'End timestamp',
            'description': 'The end timestamp of the request provided as ISO string, like: 2022-10-08T12:32:00Z',  # noqa: E501
            'schema': {
                'type': 'string'
            },
            'minOccurs': 0,
            'maxOccurs': 1,
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
        'statisticMethods': {
            'title': 'Statistical Methods',
            'description': 'The statistical methods to apply. Any out of:  [\'count\', \'min\', \'max\', \'mean\', \'sum\', \'std\', \'median\', \'majority\', \'minority\', \'unique\', \'range\', \'nodata\', \'nan\']',  # noqa: E501
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
            "polygonGeoJson": {
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


class ZonalStatisticsTimeRasterstatsProcessor(BaseProcessor):  # noqa: D101

    def __init__(self, processor_def):  # noqa: D107
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):  # noqa: D102

        cog_dir_url = data.get('cogDirUrl')
        start_ts = data.get('startTimeStamp')
        end_ts = data.get('endTimeStamp')
        input_crs = data.get('inputCrs')
        return_geojson = data.get('returnGeoJson')

        polygon_geojson = data.get('polygonGeoJson')
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

        if input_crs is not None:
            if isinstance(input_crs, str) and input_crs.startswith('EPSG:'):
                # get CRS from first COG of directory
                cog_list = get_available_cog_file_objects(cog_dir_url)
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

        if return_geojson is True:
            geojson_feature = shapely.geometry.mapping(polygon)
            geojson_feature['properties'] = outputs
            mimetype = 'application/geo+json'
            return mimetype, geojson_feature
        else:
            mimetype = 'application/json'
            outputs = {
                'values': result
            }
            return mimetype, outputs

    def __repr__(self):  # noqa: D105
        return '<ZonalStatisticsTimeRasterstatsProcessor> {}'.format(self.name)
