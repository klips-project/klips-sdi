"""Demo to test algorithms."""

from algorithms.location_info import get_location_info, get_location_info_time
from algorithms.util import url_exists, timestamp_within_range
from datetime import datetime, timezone

if __name__ == '__main__':
    cog_dir_url = 'http://localhost/cog/dresden/dresden_temperature/'

    start, end = None, None
    start = datetime(2022, 10, 3, tzinfo=timezone.utc)
    end = datetime(2022, 10, 9, tzinfo=timezone.utc)
    x = 4582606.6
    y = 3115558.3
    loc_info_results = get_location_info_time(
        cog_dir_url, x, y, start, end)
    print(loc_info_results)

    cog_url = 'http://localhost/cog/dresden/dresden_temperature/dresden_20221127T1000Z.tif'  # noqa

    if (url_exists(cog_url)):
        print(get_location_info(cog_url, x, y))

    timestamp = datetime.now()
    start = datetime(2022, 12, 1)
    end = datetime(2023, 2, 2)

    print(timestamp_within_range(timestamp, start, end))
