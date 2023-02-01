"""Functions for querying raster files build on top of rasterstats."""

import concurrent.futures
from rasterstats import point_query, zonal_stats
from urllib.parse import urljoin
from datetime import datetime
from shapely.geometry import Point, Polygon

from .util import (url_exists, timestamp_from_file_name,
                   timestamp_within_range, get_available_cog_file_objects)


def get_location_info(cog_url: str, point: Point):
    """
    Extract the value at the location of the first band of the provided COG.

    :param cog_url: the URL of the COG
    :param point: The shapely Point of the location

    :returns: the value at the location of the first band
    """
    # validate URL of COG
    if not url_exists(cog_url):
        raise Exception('URL cannot be called: {}'.format(cog_url))

    # request value from COG
    response = point_query([point], cog_url)
    return [
        {
            'band_0': response[0]
        }
    ]


def get_location_info_time(cog_dir_url: str, point: Point,
                           start_ts: datetime = None, end_ts: datetime = None):
    """Return locationinfo of many timestamps.

    :param cog_dir_url: The URL of the COG directory
    :param point: The shapely Point of the location
    :param start_ts: The start timestamp, example: "2022-10-02T12:32:00Z"
    :param end_ts: The end timestamp, example: "2022-10-09T12:32:00Z"

    :returns: A dict with the timestamps and its values
    """
    cog_list = get_available_cog_file_objects(cog_dir_url)

    cog_list = [
        {'timestamp': timestamp_from_file_name(cog_entry['name']),
         'cog_url': urljoin(
            cog_dir_url, cog_entry['name'])
         } for cog_entry in cog_list]

    def location_info_from_cog_url(cog_entry: dict):
        """Request location info from COG URL.

        :param cog_entry: A dict with the keys 'cog_url' and 'timestamp'

        :returns: A dict with location info and timestamp
        """
        cog_url = cog_entry['cog_url']
        timestamp = cog_entry['timestamp']

        ts_within_range = timestamp_within_range(timestamp,
                                                 start_ts,
                                                 end_ts)

        if ts_within_range:
            iso_timestamp = timestamp.isoformat()
            iso_timestamp = iso_timestamp.replace('+00:00', 'Z')

            if url_exists(cog_url):
                loc_info = get_location_info(cog_url, point)

                result = loc_info[0]
                result['timestamp'] = iso_timestamp

                return result
            else:
                # TODO: handle case URL cannot be reached
                return None
        else:
            # timestamp is outside of range
            return None

    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = executor.map(location_info_from_cog_url, cog_list)

    # remove empty values
    results = list(filter(None, results))

    return list(results)


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
    cog_list = get_available_cog_file_objects(cog_dir_url)

    cog_list = [
        {'timestamp': timestamp_from_file_name(cog_entry['name']),
         'cog_url': urljoin(
            cog_dir_url, cog_entry['name'])
         } for cog_entry in cog_list]

    def location_info_from_cog_url(cog_entry: dict):
        """Request location info from COG URL.

        :param cog_entry: A dict with the keys 'cog_url' and 'timestamp'

        :returns: A dict with location info and timestamp
        """
        cog_url = cog_entry['cog_url']
        timestamp = cog_entry['timestamp']

        ts_within_range = timestamp_within_range(timestamp,
                                                 start_ts,
                                                 end_ts)

        if ts_within_range:
            iso_timestamp = timestamp.isoformat()
            iso_timestamp = iso_timestamp.replace('+00:00', 'Z')

            if url_exists(cog_url):
                loc_info = get_zonal_stats(
                    cog_url, polygon, statistic_methods=statistic_methods)

                result = loc_info[0]
                result['timestamp'] = iso_timestamp

                return result
            else:
                # TODO: handle case URL cannot be reached
                return None
        else:
            # timestamp is outside of range
            return None

    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = executor.map(location_info_from_cog_url, cog_list)

    # remove empty values
    results = list(filter(None, results))

    return list(results)
