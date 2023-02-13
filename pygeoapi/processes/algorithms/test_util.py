# flake8: noqa
import pytest
from datetime import datetime
from .util import (
    timestamp_from_file_name,
    url_exists,
    timestamp_within_range
)


def test_url_exists():
    assert url_exists('https://www.google.com')
    assert url_exists('http://www.example-does-notexist.random') == False


def test_timestamp_from_file_name():
    extracted_timestamp = timestamp_from_file_name(
        'dresden_20191127T1000Z.tif')
    iso_string = extracted_timestamp.isoformat()
    assert iso_string == '2019-11-27T10:00:00+00:00'


def test_timestamp_within_range():
    # date within range
    assert timestamp_within_range(
        datetime(2000, 1, 1),
        datetime(1999, 1, 1),
        datetime(2001, 1, 1)
    )

    # date below range
    assert timestamp_within_range(
        datetime(2000, 1, 1),
        datetime(2001, 1, 1),
        datetime(2002, 1, 1)
    ) == False

    # date above range
    assert timestamp_within_range(
        datetime(2000, 1, 1),
        datetime(1998, 1, 1),
        datetime(1999, 1, 1)
    ) == False

    # raises exception on invalid range
    with pytest.raises(Exception):
        assert timestamp_within_range(
           datetime(2000,1,1),
           datetime(1999,1,1),
           datetime(1998,1,1)
        )

    # without end timestamp
    assert timestamp_within_range(
        datetime(2000, 1, 1),
        datetime(1999, 1, 1),
        None
    )

    # without start timestamp
    assert timestamp_within_range(
        datetime(2000, 1, 1),
        None,
        datetime(2001, 1, 1)
    )

    # without range
    assert timestamp_within_range(
        datetime(2000, 1, 1),
        None,
        None
    )
