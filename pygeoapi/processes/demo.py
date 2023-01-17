"""Demo to test algorithms."""

from algorithms.location_info import get_location_info, get_location_info_time
from algorithms.util import url_exists, timestamp_within_range, get_crs_from_cog, reproject
from datetime import datetime, timezone
from algorithms.zonal_stats import get_zonal_stats_time, get_zonal_stats
from shapely.geometry import Point, shape, Polygon

if __name__ == '__main__':
    cog_dir_url = 'http://localhost/cog/dresden/dresden_temperature/'

    # start, end = None, None
    # start = datetime(2022, 10, 3, tzinfo=timezone.utc)
    # end = datetime(2022, 10, 9, tzinfo=timezone.utc)
    # x = 4582606.6
    # y = 3115558.3
    # point = Point(x, y)
    # loc_info_results = get_location_info_time(
    #     cog_dir_url, point,  start, end)
    # print(loc_info_results)

    cog_url = 'http://localhost/cog/dresden/dresden_temperature/dresden_20221127T1000Z.tif'  # noqa

    # print(get_location_info(cog_url, point))

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

    polygon = shape(polygon_geojson)

    print(get_zonal_stats(cog_url, polygon))

    # zonal_stats_time = get_zonal_stats_time(
    #     cog_dir_url, polygon_geojson, start, end)

    # print(zonal_stats_time)

    # if (url_exists(cog_url)):
    #     print(get_location_info(cog_url, x, y))

    # timestamp = datetime.now()
    # start = datetime(2022, 12, 1)
    # end = datetime(2023, 2, 2)

    # print(timestamp_within_range(timestamp, start, end))

    # crs = get_crs_from_cog(cog_url)
    # print(crs)

    point = Point(11, 50)

    # print(reproject(point, 'EPSG:4326', 'EPSG:3857'))

    polygon = shape(polygon_geojson)
    # print(polygon)
    # print(reproject(polygon, 'EPSG:3035', 'EPSG:4326'))
