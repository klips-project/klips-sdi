from pygeoapi.process.base import BaseProcessor

from .algorithms.timelapse_video import generate_timelapse_video

import logging

LOGGER = logging.getLogger(__name__)

PROCESS_METADATA = {
    "version": "0.0.1",
    "id": "timelapse-video",
    "title": {"en": "Timelapse video", "de": "Zeitraffer Video"},
    "description": {
        "en": "Creates a timelapse video for  the last and upcoming 48 hours and the given area based on HHI result data",
        "de": "Erstellt ein Zeitraffervideo für die letzten und kommenden 48h und den gegebenen AUsschnitt basierend auf den Ergbnisdaten des HHI",
    },
    "keywords": ["video", "timelapse", "prediction"],
    "links": [],
    "example": {
        "inputs": {
            "title": "Heat islands in Dresden Altstadt",
            "polygonGeoJson": {
                "coordinates": [
                    [
                        [13.72242, 51.04242],
                        [13.72242, 51.06019],
                        [13.74525, 51.06019],
                        [13.74525, 51.04242],
                        [13.72242, 51.04242],
                    ]
                ],
                "type": "Polygon"
            }
        }
    },
    "inputs": {
        "title": {
            "title": "title",
            "description": "Title to render into the video",
            "minOccurs": 0,
            "maxOccurs": 1,
            "schema": {"type": "string"},
        },
        "polygonGeoJson": {
            "title": "Polygon GeoJSON",
            "description": "A polygon GeoJSON in EPSG:4326 describing the area to be visible in the video",
            "minOccurs": 1,
            "maxOccurs": 1,
            "schema": {
                "$ref": "http://schemas.opengis.net/ogcapi/features/part1/1.0/openapi/schemas/geometryGeoJSON.json"
            },
        }
    },
    "outputs": {
        "video": {
            "title": "Timelapse video",
            "description": "The timelapse video",
            "schema": {"type": "object", "contentMediaType": "video/mp4"}
        }
    }
}


class TimelapseVideoProcessor(BaseProcessor):
    def __init__(self, processor_def):
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):
        title = data.get("title", None)
        geom = data.get("polygonGeoJson", None)
        mimetype = "video/mp4"

        LOGGER.debug(f"Start to generate timelapse video...")
        try:
            result = generate_timelapse_video(
                title, geom
            )
        except Exception as e:
            LOGGER.debug(f"Failed to generate timelapse video.")
            LOGGER.debug(e)
            raise e

        LOGGER.debug(f"Successfully generated timelapse video.")
        return mimetype, result

    def __repr__(self):
        return "<TimelapseVideoProcessor> {}".format(self.name)
