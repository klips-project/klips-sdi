"""Utility functions."""

import re
import httplib2
import requests
from datetime import datetime, timezone


def url_exists(url: str):
    """Check if a URL exists.

    :param url: The URL to check

    :returns: If URL exists.
    """
    # request HEAD of URL to check its existence without downloading it
    response = httplib2.Http().request(url, 'HEAD')
    return response[0]['status'] != 200


def iso_timestamp_from_file_name(file_name: str):
    """Extract the iso timestamp from a COG file name.

    :param file_name: The COG URL

    :returns: The timestamp
    """
    match = re.search(r'\d{8}T\d{4}Z', file_name)
    timestamp = match.group()
    date_time = datetime\
        .strptime(timestamp, "%Y%m%dT%H%MZ")\
        .replace(tzinfo=timezone.utc)
    date_time = date_time.isoformat()

    return date_time


def get_available_cog_file_names(cog_dir_url: str):
    """Read available COG file names from an URL.

    :param cog_dir_url: The URL to check

    :returns: The containing COG image name
    """
    response = requests.get(cog_dir_url)
    return response.json()
