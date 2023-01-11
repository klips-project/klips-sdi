from rasterstats import point_query
from shapely.geometry import Point
import httplib2
import requests
import re
from datetime import datetime, timezone
from urllib.parse import urljoin


def get_location_info(cog_url, x, y):
    """
    Extracts the value at the location of the first band of the provided COG

    :param cog_url: the URL of the COG
    :param x: the x coordinate in the same projection as the COG
    :param y: the y coordinate in the same projection as the COG

    :returns: the value at the location of the first band
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


def get_location_info_time(cog_dir_url, cog_list, x, y):
    results = {}
    for cog in cog_list:
        file_name = cog['name']
        match = re.search(r'\d{8}T\d{4}Z', file_name)
        timestamp = match.group()
        date_time = datetime.strptime(
            timestamp, "%Y%m%dT%H%MZ").replace(tzinfo=timezone.utc)
        cog_url = urljoin(cog_dir_url, file_name)
        loc_info = get_location_info(cog_url, x, y)
        iso_timestamp = date_time.isoformat()
        results[iso_timestamp] = loc_info
    return results


def get_available_time_stamps(cog_dir_url):
    response = requests.get(cog_dir_url)
    cog_info = response.json()

    return cog_info


# if __name__ == '__main__':
    # cog_dir_url = 'http://localhost/cog/dresden/dresden_temperature/';
    # cog_list = get_available_time_stamps(cog_dir_url)

    # x = 4582606.6
    # y = 3115558.3
    # loc_info_results = get_location_info_time(cog_dir_url, cog_list, x, y)
    # print(loc_info_results)

    # cog_url = 'http://localhost/cog/dresden/dresden_temperature/dresden_20221127T1000Z.tif'

    # print(get_location_info(cog_url, x, y))
