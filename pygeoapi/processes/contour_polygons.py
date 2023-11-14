# noqa: D100
import logging

from pygeoapi.process.base import BaseProcessor

from .algorithms.contour_polygons import get_contour_polygons

LOGGER = logging.getLogger(__name__)

PROCESS_METADATA = {
    "version": "0.0.1",
    "id": "contour-polygons",
    "title": {"en": "Contour polygons", "de": "Konturpolygone"},
    "description": {
        "en": "Creates polygons of same value (contour polygons) for a set interval based on raster input.",  # noqa: E501
        "de": "Erstellt Polygone gleicher Werte (Konturpolygone) für ein festgelegtes Intervall basierend auf einer Raster-Datei.",  # noqa: E501
    },
    "keywords": ["contour", "polygons", "prediction"],
    "links": [],
    "example": {
        "inputs": {
            "cog_url": "http://nginx/cog/dresden/dresden_temperature/dresden_20230101T0000Z.tif",  # noqa: E501
            "interval": 1,
            "bands": [1, 2, 3],
        },
    },
    "inputs": {
        "cogUrl": {
            "title": "URL of the COG",
            "description": "The public available URL of the COG to query",  # noqa: E501
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
    },
    "outputs": {
        "geom": {
            "title": "geometry",
            "description": "The polygons with same values as (multi-)polygons",  # noqa: E501
            "schema": {"type": "list"},
        },
    },
}


class ContourPolygonsProcessor(BaseProcessor):  # noqa: D101
    def __init__(self, processor_def):  # noqa: D107
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):
        cog_url = data.get("cogURL")
        interval = data.get("interval")
        bands = data.get("bands")
        mimetype = "application/json"

        LOGGER.debug("Start to generate polygons...")
        try:
            result = get_contour_polygons(cog_url, interval, bands)
        except Exception as e:
            LOGGER.debug("Failed to generate polygons.")
            LOGGER.debug(e)
            raise e

        LOGGER.debug("Successfully generated polygons.")
        return mimetype, result

    def __repr__(self):  # noqa: D105
        return "<ContourPolygonsProcessor> {}".format(self.name)
