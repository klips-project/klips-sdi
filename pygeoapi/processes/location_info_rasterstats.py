# noqa: D100
import logging
import shapely


from pygeoapi.process.base import BaseProcessor
from .algorithms.rasterstats_algorithms import get_location_info
from .algorithms.util import get_crs_from_cog, reproject
from shapely.geometry import Point

LOGGER = logging.getLogger(__name__)

#: Process metadata and description
PROCESS_METADATA = {
    "version": "0.1.0",
    "id": "location-info-rasterstats",
    "title": {
        "en": "Location info of a COG using rasterstats",
        "de": "Standortinformation eines COGs mit rasterstats",
    },
    "description": {
        "en": "Get information of a location of an publicly accessible COG.",  # noqa: E501
        "de": "Fragt Rasterwerte eines öffentlich zugänglichen COG basierend auf Input-Koordinaten ab.",  # noqa: E501
    },
    "keywords": ["rasterstats", "locationinfo", "featureinfo"],
    "links": [],
    "inputs": {
        "x": {
            "title": "X coordinate",
            "description": "The x coordinate of point to query. Must be in the same projection as the COG.",  # noqa: E501
            "schema": {"type": "string"},
            "minOccurs": 1,
            "maxOccurs": 1,
        },
        "y": {
            "title": "Y coordinate",
            "description": "The y coordinate of point to query. Must be in the same projection as the COG.",  # noqa: E501
            "schema": {"type": "string"},
            "minOccurs": 1,
            "maxOccurs": 1,
        },
        "cogUrl": {
            "title": "URL of the COG",
            "description": "The public available URL of the COG to query",
            "schema": {"type": "string"},
            "minOccurs": 1,
            "maxOccurs": 1,
        },
        "inputCrs": {
            "title": "Coordinate reference system",
            "description": "The coordinate reference system of the provided geometry",  # noqa: E501
            "schema": {"type": "string"},
            "minOccurs": 0,
            "maxOccurs": 1,
        },
        "returnGeoJson": {
            "title": "Return GeoJSON",
            "description": "If a GeoJSON shall be returned, including the provided the geometry.",  # noqa: E501
            "schema": {"type": "boolean"},
            "minOccurs": 0,
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
        "value": {
            "title": "location value",
            "description": "The values at the requested location of the of the COG.",  # noqa: E501
            "schema": {"type": "string"},
        }
    },
    "example": {
        "inputs": {
            "x": 12.2,
            "y": 50.4,
            "cogUrl": "https://example.com/sample-cog.tif",
            "bands": [1, 2, 3],
        }
    },
}


class LocationInfoRasterstatsProcessor(BaseProcessor):  # noqa: D101
    def __init__(self, processor_def):  # noqa: D107
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):  # noqa: D102
        y = data.get("y")
        x = data.get("x")
        cog_url = data.get("cogUrl")
        input_crs = data.get("inputCrs")
        return_geojson = data.get("returnGeoJson")
        bands = data.get("bands") or [1]

        point = Point(x, y)

        if input_crs is not None:
            if isinstance(input_crs, str) and input_crs.startswith("EPSG:"):
                cog_crs = get_crs_from_cog(cog_url)

                if input_crs != cog_crs:
                    point = reproject(point, input_crs, cog_crs)
                else:
                    # provided CRS by user is identical to COG
                    # no conversion needed
                    pass
            else:
                raise Exception(
                    "Provided CRS from user is not valid: {}".format(input_crs)
                )

        value = get_location_info(cog_url, point, bands)

        if return_geojson:
            geojson_feature = shapely.geometry.mapping(point)
            geojson_feature["properties"] = value[0]
            mimetype = "application/geo+json"
            return mimetype, geojson_feature
        else:
            outputs = {"values": value}
            mimetype = "application/json"
            return mimetype, outputs

    def __repr__(self):  # noqa: D105
        return "<LocationInfoRasterstatsProcessor> {}".format(self.name)
