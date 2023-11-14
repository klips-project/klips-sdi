# noqa: D100
from datetime import datetime

import logging

from pygeoapi.process.base import BaseProcessor

from .algorithms.util import (
    url_exists,
)

from .algorithms.contour_polygons import get_contour_polygons_time

LOGGER = logging.getLogger(__name__)

PROCESS_METADATA = {
    "version": "0.0.1",
    "id": "contour-polygons-time",
    "title": {
        "en": "Time-based contour polygons",
        "de": "Zeitbasierte Konturpolygone",
    },  # noqa: E501
    "description": {
        "en": "Creates time-based polygons of same value (contour polygons) for a set interval based on raster input.",  # noqa: E501
        "de": "Erstellt zeitbasierte Polygone gleicher Werte (Konturpolygone) für ein festgelegtes Intervall basierend auf einer Raster-Datei.",  # noqa: E501
    },
    "keywords": ["contour", "polygons", "prediction"],
    "links": [],
    "example": {
        "inputs": {
            "cog_url": "http://nginx/cog/dresden/dresden_temperature/",
            "interval": 1,
            "bands": [1, 2, 3],
        },
    },
    "inputs": {
        "cogDirUrl": {
            "title": "URL COG directory",
            "description": 'The public available URL of the COG directory to query. The contents of the directory must be accessible via NGINX JSON autoindex. It only accepts GeoTIFFs with a filename like "dresden_20221101T1000Z.tif"',  # noqa: E501
            "schema": {"type": "string"},
            "minOccurs": 1,
            "maxOccurs": 1,
        },
        "interval": {
            "title": "Interval",
            "description": "A numeric value describing the interval (steps) in which to create the polygons",  # noqa: E501
            "schema": {"type": "integer"},
            "minOccurs": 1,
            "maxOccurs": 1,
        },
        "bands": {
            "title": "Rasterbands",
            "description": "The rasterbands to query",  # noqa: E501
            "schema": {"type": "array"},
            "minOccurs": 0,
            "maxOccurs": 1,
        },
        "startTimeStamp": {
            "title": "Start timestamp",
            "description": "The start timestamp of the request provided as ISO string, like: 2022-10-08T12:32:00Z",  # noqa: E501
            "schema": {"type": "string"},
            "minOccurs": 0,
            "maxOccurs": 1,
        },
        "endTimeStamp": {
            "title": "End timestamp",
            "description": "The end timestamp of the request provided as ISO string, like: 2022-10-08T12:32:00Z",  # noqa: E501
            "schema": {"type": "string"},
            "minOccurs": 0,
            "maxOccurs": 1,
        },
    },
    "outputs": {
        "geom": {
            "title": "geometry",
            "description": "The polygons with same values as (multi-)polygons per timestamp",  # noqa: E501
            "schema": {"type": "list"},
        },
    },
}


class ContourPolygonsTimeProcessor(BaseProcessor):  # noqa: D101
    def __init__(self, processor_def):  # noqa: D107
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):
        cog_dir_url = data.get("cogDirUrl")
        interval = data.get("interval")
        start_ts = data.get("startTimeStamp")
        end_ts = data.get("endTimeStamp")
        bands = data.get("bands")
        mimetype = "application/json"

        if not url_exists(cog_dir_url):
            raise Exception(
                "Cannot access provided URL: {}".format(cog_dir_url)  # noqa: E501
            )

        if start_ts:
            start_ts = start_ts.replace("Z", "+00:00")
            start_ts = datetime.fromisoformat(start_ts)

        if end_ts:
            end_ts = end_ts.replace("Z", "+00:00")
            end_ts = datetime.fromisoformat(end_ts)

        LOGGER.debug("Start to generate polygons...")
        try:
            result = get_contour_polygons_time(
                cog_dir_url, interval, start_ts, end_ts, bands
            )
        except Exception as e:
            LOGGER.debug("Failed to generate polygons.")
            LOGGER.debug(e)
            raise e

        LOGGER.debug("Successfully generated polygons.")
        return mimetype, result

    def __repr__(self):  # noqa: D105
        return "<ContourPolygonsTimeProcessor> {}".format(self.name)
