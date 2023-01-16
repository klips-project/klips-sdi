"""Demo to test alogrithms."""

from location_info import (
    get_available_cog_file_names,
    get_location_info_time,
    get_location_info
)

if __name__ == '__main__':
    cog_dir_url = 'http://localhost/cog/dresden/dresden_temperature/'
    cog_list = get_available_cog_file_names(cog_dir_url)
    # print(cog_list)

    x = 4582606.6
    y = 3115558.3
    loc_info_results = get_location_info_time(cog_dir_url, cog_list, x, y)
    print(loc_info_results)

    cog_url = 'http://localhost/cog/dresden/dresden_temperature/dresden_20221127T1000Z.tif'  # noqa

    print(get_location_info(cog_url, x, y))
