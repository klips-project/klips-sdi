"""Functions to compute zonal statistics from COGs."""

from shapely.geometry import shape
from rasterstats import zonal_stats
from datetime import datetime
from urllib.parse import urljoin
from .util import (url_exists, timestamp_from_file_name,
                   timestamp_within_range, get_available_cog_file_names)


def get_zonal_stats(cog_url: str, polygon_geojson: dict,
                    statistic_methods: list = ['count',
                                               'min', 'mean', 'max', 'median']
                    ):
    """Create zonal statistics from a COG using a single polygon as input.

    :param cog_url: the URL of the COG
    :param polygon_geojson: A single polygon structured as GeoJSON
                            in the same projection as the COG
    :param statistic_methods: An array of statistic method names
                  e.g. ['count', 'min', 'max', 'mean', 'sum',
                  'std', 'median', 'majority', 'minority', 'unique',
                  'range', 'nodata', 'nan']
                  defaults to ['count', 'min', 'mean', 'max', 'median']

    :returns The zonal statistics
    """
    # validate URL of COG
    if not url_exists(cog_url):
        raise Exception('URL cannot be called: {}'.format(cog_url))

    # validate provided statistic methods
    if not isinstance(statistic_methods, list):
        raise Exception(
            'Provided statistic methods are not structured as list')

    # convert list of statistic methods to string
    stats = ' '.join(statistic_methods)

    polygon = shape(polygon_geojson)
    if polygon.type != 'Polygon':
        raise Exception('Provided geometry is no polygon')

    return zonal_stats(
        polygon,
        cog_url,
        stats=stats
    )


def get_zonal_stats_time(cog_dir_url, polygon_geojson,
                         start_ts: datetime = None, end_ts: datetime = None,
                         statistic_methods=['count', 'min',
                                            'mean', 'max', 'median'],
                         ):
    """Create time-based zonal statistics.

    TODO
    """
    results: dict = {}

    cog_list = get_available_cog_file_names(cog_dir_url)

    for cog in cog_list:
        # TODO: consider running in async mode to increase speed
        file_name = cog['name']

        cog_url = urljoin(cog_dir_url, file_name)
        timestamp = timestamp_from_file_name(file_name)

        ts_within_range = timestamp_within_range(timestamp,
                                                 start_ts,
                                                 end_ts)

        if ts_within_range:
            iso_timestamp = timestamp.isoformat()
            iso_timestamp = iso_timestamp.replace('+00:00', 'Z')

            if url_exists(cog_url):
                zonal_info = get_zonal_stats(
                    cog_url, polygon_geojson,
                    statistic_methods=statistic_methods
                )
                results[iso_timestamp] = zonal_info
            else:
                # TODO: handle case URL cannot be reached
                pass
        else:
            # timestamp is outside of range
            pass

    return results


if __name__ == '__main__':
    cog_url = "http://localhost/ecostress_3035_cog.tif"
    polygon_geojson = {
        "type": "Polygon",
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
        ]
    }
    # stats = None
    result = get_zonal_stats(cog_url, polygon_geojson)
    print(result)
