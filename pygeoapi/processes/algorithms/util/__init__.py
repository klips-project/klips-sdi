"""Utility functions."""

# NOTE: class must be in separate module to be callable by demo.py

import re
import requests
from datetime import datetime, timezone


def url_exists(url: str):
    """Check if a URL exists.

    :param url: The URL to check

    :returns: If URL exists.
    """
    response = requests.head(url)
    return response.status_code == 200


def timestamp_from_file_name(file_name: str):
    """Extract the timestamp from a COG file name.

    :param file_name: The COG URL

    :returns: The timestamp
    """
    match = re.search(r'\d{8}T\d{4}Z', file_name)
    timestamp = match.group()
    date_time = datetime\
        .strptime(timestamp, "%Y%m%dT%H%MZ")\
        .replace(tzinfo=timezone.utc)

    return date_time


def get_available_cog_file_names(cog_dir_url: str):
    """Read available COG file names from an URL.

    :param cog_dir_url: The URL to check

    :returns: The containing COG image name
    """
    response = requests.get(cog_dir_url)
    return response.json()


def timestamp_within_range(timestamp: datetime,
                           start: datetime = None, end: datetime = None):
    """
    Check if timestamp is in range.

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
        return timestamp <= end_valid
    else:
        return True
