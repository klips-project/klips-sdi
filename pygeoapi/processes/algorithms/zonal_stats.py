"""Functions to compute zonal statistics from COGs."""

from shapely.geometry import Polygon
from rasterstats import zonal_stats
from datetime import datetime
from urllib.parse import urljoin
from .util import (url_exists, timestamp_from_file_name,
                   timestamp_within_range, get_available_cog_file_names)


def get_zonal_stats(cog_url: str, polygon: Polygon,
                    statistic_methods: list = ['count',
                                               'min',
                                               'mean', 'max', 'median']
                    ):
    """Create zonal statistics from a COG using a single polygon as input.

    :param cog_url: the URL of the COG
    :param polygon: A shapely Polygon in the same projection as the COG
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

    if polygon.type != 'Polygon':
        raise Exception('Provided geometry is no polygon')

    return zonal_stats(
        polygon,
        cog_url,
        stats=stats
    )


def get_zonal_stats_time(cog_dir_url, polygon: Polygon,
                         start_ts: datetime = None, end_ts: datetime = None,
                         statistic_methods=['count', 'min',
                                            'mean', 'max', 'median'],
                         ):
    """Create time-based zonal statistics.

    :param cog_dir_url: The URL of the COG directory
    :param polygon: A shapely Polygon in the same projection as the COG
    :param statistic_methods: An array of statistic method names
                  e.g. ['count', 'min', 'max', 'mean', 'sum',
                  'std', 'median', 'majority', 'minority', 'unique',
                  'range', 'nodata', 'nan']
                  defaults to ['count', 'min', 'mean', 'max', 'median']
    :param start_ts: The start timestamp, example: "2022-10-02T12:32:00Z"
    :param end_ts: The end timestamp, example: "2022-10-09T12:32:00Z"

    :returns: A dict with the timestamps and its values
    """
    results = []

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
                    cog_url, polygon,
                    statistic_methods=statistic_methods
                )
                result = zonal_info[0]
                result['timestamp'] = iso_timestamp

                results.append(result)
            else:
                # TODO: handle case URL cannot be reached
                pass
        else:
            # timestamp is outside of range
            pass

    return results
