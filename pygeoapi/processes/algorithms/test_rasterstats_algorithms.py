# flake8: noqa

from .rasterstats_algorithms import (
    get_location_info,
    get_location_info_time,
    get_zonal_stats,
    get_zonal_stats_time,
)
from shapely.geometry import Point, shape
from datetime import datetime
import pytz


def test_get_location_info():
    cog_url = "http://localhost:81/sample_dresden_float32_3bands.tif"

    point = Point(4578087, 3114847)

    result = get_location_info(cog_url, point, [1, 2, 3])

    assert type(result) == list
    assert len(result) == 1

    result_dict = result[0]
    assert "band_1" in result_dict
    assert "band_2" in result_dict
    assert "band_3" in result_dict

    assert type(result_dict["band_1"]) == float
    assert type(result_dict["band_2"]) == float
    assert type(result_dict["band_3"]) == float


def test_get_location_info_time():
    cog_dir_url = "http://localhost:81/dummy-mosaic/"

    point = Point(4578087, 3114847)

    results = get_location_info_time(
        cog_dir_url,
        point,
        start_ts=datetime(2023, 1, 1, 10, tzinfo=pytz.UTC),
        end_ts=datetime(2023, 1, 1, 12, tzinfo=pytz.UTC),
        bands=[1, 2, 3],
    )

    assert type(results) == list
    assert len(results) == 3

    for result_per_timestamp in results:
        assert type(result_per_timestamp["band_1"]) == float
        assert type(result_per_timestamp["band_2"]) == float
        assert type(result_per_timestamp["band_3"]) == float


def test_get_zonal_stats():
    cog_url = "http://localhost:81/sample_dresden_float32_3bands.tif"

    polygon_geojson = {
        "type": "Polygon",
        "coordinates": [
            [
                [4575246, 3122981],
                [4601787, 3110783],
                [4578801, 3104102],
                [4575246, 3122981],
            ]
        ],
    }

    polygon = shape(polygon_geojson)
    bands = [1, 2, 3]
    result = get_zonal_stats(cog_url, polygon, bands=bands)

    assert type(result) == list
    assert len(result) == 3

    for item in result:
        assert type(item["min"]) == float
        assert type(item["max"]) == float
        assert type(item["median"]) == float
        assert type(item["mean"]) == float
        assert type(item["count"]) == int
        assert type(item["band"]) == int


def test_get_zonal_stats_time():
    cog_dir_url = "http://localhost:81/dummy-mosaic/"

    polygon_geojson = {
        "type": "Polygon",
        "coordinates": [
            [
                [4575246, 3122981],
                [4601787, 3110783],
                [4578801, 3104102],
                [4575246, 3122981],
            ]
        ],
    }

    polygon = shape(polygon_geojson)
    results = get_zonal_stats_time(
        cog_dir_url,
        polygon,
        start_ts=datetime(2023, 1, 1, 10, tzinfo=pytz.UTC),
        end_ts=datetime(2023, 1, 1, 12, tzinfo=pytz.UTC),
        bands=[1, 2, 3],
    )

    assert type(results) == list
    assert len(results) == 9

    for item in results:
        assert "band" in item
        assert "count" in item
        assert "max" in item
        assert "min" in item
        assert "median" in item
        assert "timestamp" in item
