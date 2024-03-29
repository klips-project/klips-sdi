"""Utility functions."""

# NOTE: class must be in separate module to be callable by demo.py

import re
import requests
from datetime import datetime, timezone
from rio_cogeo.cogeo import cog_info
import pyproj
from shapely.ops import transform
from shapely import geometry


def url_exists(url: str):
    """Check if a URL exists.

    :param url: The URL to check

    :returns: If URL exists.
    """
    try:
        response = requests.head(url)
        return response.status_code == 200
    except Exception as e:
        print(e)
        return False


def timestamp_from_file_name(file_name: str):
    """Extract the timestamp from a COG file name.

    :param file_name: The COG URL

    :returns: The timestamp
    """
    match = re.search(r"\d{8}T\d{4}Z", file_name)
    timestamp = match.group()
    date_time = datetime.strptime(timestamp, "%Y%m%dT%H%MZ").replace(
        tzinfo=timezone.utc
    )

    return date_time


def get_available_cog_file_objects(cog_dir_url: str):
    """Read available COG file objects from an URL.

    Only COG files ending with '.tif' are returned.

    :param cog_dir_url: The URL to check

    :returns: The containing COG image objects
    """
    # the required suffix of the tif files
    TIF_SUFFIX = ".tif"

    response = requests.get(cog_dir_url)
    file_objects = response.json()

    # remove files not having the '.tif' suffix
    result = filter(lambda file: file["name"].endswith(TIF_SUFFIX), file_objects)
    return list(result)


def timestamp_within_range(
    timestamp: datetime, start: datetime = None, end: datetime = None
):
    """Check if timestamp is in range.

    :param timestamp: The timestamp to check
    :param start: The start timestamp to compare, can be None
    :param end: The end timestamp to compare, can be None

    :returns: If timestamp is within provided range
    """
    start_valid = start is not None
    end_valid = end is not None

    if start_valid and end_valid:
        if end <= start:
            raise Exception("Input range is not valid")
        return start <= timestamp and timestamp <= end
    elif start_valid and not end_valid:
        return start <= timestamp
    elif not start_valid and end_valid:
        return timestamp <= end
    else:
        return True


def get_crs_from_cog(cog_url: str):
    """Get coordinate reference system from a COG.

    :param cog_url: The URL of the COG

    :returns: The CRS of the COG
    """
    info = cog_info(cog_url)
    return info["GEO"]["CRS"]


def reproject(geometry: geometry, crs_from: str, crs_to: str):
    """Reproject a geometry.

    :param geometry: The shapely geometry
    :param crs_from: The EPSG code from the geometry. Example: "EPSG:4326"
    :param crs_to: The EPSG code to transform to. Example: "EPSG:3857"

    :returns: The projected shapely geometry
    """
    crs_from = pyproj.CRS(crs_from)
    crs_to = pyproj.CRS(crs_to)

    project_function = pyproj.Transformer.from_crs(
        crs_from, crs_to, always_xy=True
    ).transform

    return transform(project_function, geometry)
