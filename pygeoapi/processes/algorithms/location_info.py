from rasterstats import point_query
from shapely.geometry import Point
import httplib2

def get_location_info(cog_url, x, y):
    """
    Extracts the value at the location of the first band of the provided COG

    :param cog_url: the URL of the COG
    :param x: the x coordinate in the same projection as the COG
    :param y: the y coordinate in the same projection as the COG

    :returns: tuple of headers, status code, content
    """

    # validate input coordinates
    try:
        x = int(x)
        y = int(y)
    except:
        raise Exception('Provided coordinates are not numbers')

    # validate URL of COG
    try:
        # request HEAD of URL to check its existence without downloading it
        response = httplib2.Http().request(cog_url, 'HEAD')
        assert response[0]['status'] != 200
    except:
        raise Exception(
            'Provided URL does not exist or cannot be reached.')

    # request value from COG
    point = Point(x, y)
    response = point_query([point], cog_url)

    return response[0]

