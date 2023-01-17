"""Functions to get information from single points."""

from rasterstats import point_query
from shapely.geometry import Point
from urllib.parse import urljoin
from .util import (url_exists, timestamp_from_file_name,
                   timestamp_within_range, get_available_cog_file_names)
from datetime import datetime


def get_location_info(cog_url: str, x, y):
    """
    Extract the value at the location of the first band of the provided COG.

    :param cog_url: the URL of the COG
    :param x: the x coordinate in the same projection as the COG
    :param y: the y coordinate in the same projection as the COG

    :returns: the value at the location of the first band
    """
    # validate input coordinates
    try:
        x = int(x)
        y = int(y)
    except ValueError():
        raise Exception('Provided coordinates are not numbers')

    # validate URL of COG
    if not url_exists(cog_url):
        raise Exception('URL cannot be called: {}'.format(cog_url))

    # request value from COG
    point = Point(x, y)
    response = point_query([point], cog_url)
    result = [
        {
            'band_0': response[0]
        }
    ]

    return result


def get_location_info_time(cog_dir_url: str, x, y,
                           start_ts: datetime = None, end_ts: datetime = None):
    """Return locationinfo of many timestamps.

    :param cog_dir_url: The URL of the COG directory
    :param x: The x coordinate
    :param y: The y coordinate
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
                loc_info = get_location_info(cog_url, x, y)

                result = loc_info[0]
                result['timestamp'] = iso_timestamp

                results.append(result)
            else:
                # TODO: handle case URL cannot be reached
                pass
        else:
            # timestamp is outside of range
            pass

    return results
