"""Functions for querying raster files build on top of rasterstats."""

import concurrent.futures
from rasterstats import point_query, zonal_stats
from urllib.parse import urljoin
from datetime import datetime
from shapely.geometry import Point, Polygon

from .util import (url_exists, timestamp_from_file_name,
                   timestamp_within_range, get_available_cog_file_objects)


def get_location_info(cog_url: str, point: Point, bands: list = [1]):
    """
    Extract values at a location of a provided COG.

    :param cog_url: The URL of the COG
    :param point: The shapely Point of the location
    :param bands: The bands to query

    :returns: the value at the location of the first band
    """
    # validate URL of COG
    if not url_exists(cog_url):
        raise Exception('URL cannot be called: {}'.format(cog_url))

    results = {}
    for band in bands:
        response = point_query([point], cog_url, band)
        property_name = f'band_{band}'
        results[property_name] = response[0]

    return [results]


def get_location_info_time(cog_dir_url: str, point: Point,
                           start_ts: datetime = None, end_ts: datetime = None,
                           bands: list = [1]):
    """Return locationinfo of many timestamps.

    :param cog_dir_url: The URL of the COG directory
    :param point: The shapely Point of the location
    :param start_ts: The start timestamp
    :param end_ts: The end timestamp
    :param bands: The bands to query

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
                if bands is not None:
                    loc_info = get_location_info(cog_url, point, bands)
                else:
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
                                               'mean', 'max', 'median'],
                    bands: list = [1]
                    ):
    """Create zonal statistics from a COG using a single polygon as input.

    :param cog_url: the URL of the COG
    :param polygon: A shapely Polygon in the same projection as the COG
    :param statistic_methods: An array of statistic method names
                  e.g. ['count', 'min', 'max', 'mean', 'sum',
                  'std', 'median', 'majority', 'minority', 'unique',
                  'range', 'nodata', 'nan']
                  defaults to ['count', 'min', 'mean', 'max', 'median']
    :param bands: The bands to query

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

    # compute results and reshape to expected structure
    results = []
    for band in bands:
        band_result = zonal_stats(
            polygon,
            cog_url,
            stats=stats,
            band=band
        )
        band_result = band_result[0]
        band_result['band'] = band
        results.append(band_result)
    return results


def get_zonal_stats_time(cog_dir_url, polygon: Polygon,
                         start_ts: datetime = None, end_ts: datetime = None,
                         statistic_methods=['count', 'min',
                                            'mean', 'max', 'median'],
                         bands: list = [1]
                         ):
    """Create time-based zonal statistics.

    :param cog_dir_url: The URL of the COG directory
    :param polygon: A shapely Polygon in the same projection as the COG
    :param statistic_methods: An array of statistic method names
                  e.g. ['count', 'min', 'max', 'mean', 'sum',
                  'std', 'median', 'majority', 'minority', 'unique',
                  'range', 'nodata', 'nan']
                  defaults to ['count', 'min', 'mean', 'max', 'median']
    :param start_ts: The start timestamp
    :param end_ts: The end timestamp
    :param bands: The bands to query

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
                band_results = get_zonal_stats(
                    cog_url, polygon, statistic_methods=statistic_methods,
                    bands=bands)

                for band_result in band_results:
                    band_result['timestamp'] = iso_timestamp

                return band_results
            else:
                # TODO: handle case URL cannot be reached
                return None
        else:
            # timestamp is outside of range
            return None

    with concurrent.futures.ThreadPoolExecutor() as executor:
        results_per_cog = executor.map(location_info_from_cog_url, cog_list)

    # remove empty values
    results_per_cog = list(filter(None, results_per_cog))

    # flatten the resulting list of lists
    flattened = []
    for single_cog_result in results_per_cog:
        flattened += single_cog_result

    return flattened
