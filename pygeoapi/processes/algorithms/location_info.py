"""Functions to get information from single points."""

from rasterstats import point_query
from shapely.geometry import Point
from urllib.parse import urljoin
from .util import url_exists, iso_timestamp_from_file_name


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

    return response[0]


def get_location_info_time(cog_dir_url, cog_list, x, y):
    """Return locationinfo of many timestamps.

    :param cog_dir_url: The URL of the COG directory
    :param cog_list: The filenames of the COGs to process
    :x: The x coordinate
    :y: The y coordinate

    :returns: A dict with the timestamps and its values
    """
    results: dict = {}
    for cog in cog_list:
        file_name = cog['name']

        cog_url = urljoin(cog_dir_url, file_name)
        if url_exists(cog_url):
            loc_info = get_location_info(cog_url, x, y)

            iso_timestamp = iso_timestamp_from_file_name(file_name)

            results[iso_timestamp] = loc_info
        else:
            # TODO: handle case URL cannot be reached
            pass

    return results
