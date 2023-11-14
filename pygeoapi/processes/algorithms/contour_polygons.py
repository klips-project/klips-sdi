# flake8: noqa
"""Function for generating contour polygons from raster files."""
import os
import json
import logging
import concurrent.futures

from datetime import datetime
from itertools import groupby
from urllib.parse import urljoin

import geojson
from osgeo import gdal
from osgeo import osr
from osgeo import ogr

from shapely.wkt import loads
from shapely.ops import unary_union

from .util import (
    url_exists,
    timestamp_from_file_name,
    timestamp_within_range,
    get_available_cog_file_objects,
)

LOGGER = logging.getLogger(__name__)


def get_contour_polygons(
    cog_url: str,
    interval: int,
    bands: list = [1],
):
    """Create contour polygons from a COG.

    :param cog_url: the URL of the COG
    :param interval: The interval for which to calculate contour polygons
    :param bands: The bands to query

    :returns The contour polygons as multipolygons in json list
    """
    # validate URL of COG
    if not url_exists(cog_url):
        raise Exception("URL cannot be called: {}".format(cog_url))

    # get COG input from URL
    raster_input = gdal.Open(cog_url)

    # calculate results
    results = []
    for band in bands:
        raster_band = raster_input.GetRasterBand(band)
        proj = osr.SpatialReference(wkt=raster_input.GetProjection())

        # get current hour datetime
        now = datetime.now()
        now_flattened = now.replace(minute=0, second=0, microsecond=0)

        # create cache folder and target file
        cache_folder = "/tmp/polygon"

        target_folder = f"{cache_folder}/{now_flattened.isoformat()}"

        if not os.path.exists(target_folder):
            os.makedirs(target_folder)
        target_filename = "contour.shp"
        target = os.path.join(target_folder, target_filename)
        # LOGGER.debug("target:", target)

        geojson_driver = ogr.GetDriverByName("ESRI Shapefile")

        # check if we can deliver contourlines from cache
        # if os.path.exists(target) is True:
        #     LOGGER.info("Delivering Contourlines from Cache... ", target)
        #     geojson_ds = ogr.Open(target)
        #     geojson_layer = geojson_ds.GetLayer()

        LOGGER.info("Generating Contourlines... ")
        geojson_ds = geojson_driver.CreateDataSource(target)
        geojson_layer = geojson_ds.CreateLayer(target, proj)
        field_defn = ogr.FieldDefn("ID", ogr.OFTInteger)
        geojson_layer.CreateField(field_defn)
        field_defn = ogr.FieldDefn("temp", ogr.OFTReal)
        geojson_layer.CreateField(field_defn)

        # generate contourlines
        gdal.ContourGenerate(
            raster_band,  # Band srcBand
            interval,  # double This defines contour intervals
            0,  # double contourBase
            [],  # int fixedLevelCount
            0,  # int useNoData
            0,  # double noDataValue
            geojson_layer,  # Layer dstLayer
            0,  # int idField
            1,  # int elevField
        )

        # polygonize contourlines
        LOGGER.info("Polygonizing Contourlines... ")
        polygons = []
        for findex in range(geojson_layer.GetFeatureCount()):
            feature = geojson_layer.GetFeature(findex)
            temp = feature.GetField("temp")
            wkt = loads(feature.geometry().ExportToWkt())
            polygon = wkt.convex_hull
            polygons.append((polygon, temp))

        # generate multipolygons from single polygons
        multipolygons = []
        polygons = sorted(polygons, key=lambda k: k[1])
        for key, group in groupby(polygons, lambda x: x[1]):
            for poly in group:
                geom_list = [poly[0] for poly in group]
                multipoly = unary_union(geom_list)
                multipolygons.append(
                    {
                        "geom": geojson.dumps(multipoly),
                        "temp": key,
                        "empty": multipoly.is_empty,
                        "band": band,
                    }
                )
        multipolygons = [
            item for item in multipolygons if item["empty"] is False
        ]  # noqa: E501
        for item in multipolygons:
            del item["empty"]
        multipolygons = json.dumps(multipolygons)

        # return results
        results.append(multipolygons)
    LOGGER.info("Multipolygons generated")
    return results


def get_contour_polygons_time(
    cog_dir_url,
    interval: int = 1,
    start_ts: datetime = None,
    end_ts: datetime = None,
    bands: list = [1],
):
    """Create contour polygons from a COG using a single polygon as input.

    :param cog_dir_url: The URL of the COG directory
    :param interval: The interval for which to calculate contour polygons
    :param start_ts: The start timestamp
    :param end_ts: The end timestamp
    :param bands: The bands to query

    :returns: A dict with the timestamps and multipolygons
    """
    cog_list = get_available_cog_file_objects(cog_dir_url)

    cog_list = [
        {
            "timestamp": timestamp_from_file_name(cog_entry["name"]),
            "cog_url": urljoin(cog_dir_url, cog_entry["name"]),
        }
        for cog_entry in cog_list
    ]

    def location_info_from_cog_url(cog_entry: dict):
        """Request location info from COG URL.

        :param cog_entry: A dict with the keys 'cog_url' and 'timestamp'

        :returns: A dict with location info and timestamp
        """
        cog_url = cog_entry["cog_url"]
        timestamp = cog_entry["timestamp"]

        ts_within_range = timestamp_within_range(timestamp, start_ts, end_ts)

        if ts_within_range:
            iso_timestamp = timestamp.isoformat()
            iso_timestamp = iso_timestamp.replace("+00:00", "Z")

            if url_exists(cog_url):

                polygons = get_contour_polygons(cog_url, interval, bands)

                result = polygons
                # result["timestamp"] = iso_timestamp

                return result
            else:
                # TODO: handle case URL cannot be reached
                return None
        else:
            # timestamp is outside of range
            return None

    with concurrent.futures.ThreadPoolExecutor() as executor:
        results_per_cog = executor.map(location_info_from_cog_url, cog_list)

    # remove empty values
    results_per_cog = list(filter(None, results_per_cog))

    # flatten the resulting list of lists
    flattened = []
    for single_cog_result in results_per_cog:
        flattened += single_cog_result

    LOGGER.info(flattened)

    return flattened
