# noqa: D100
import logging
import shapely
from pygeoapi.process.base import BaseProcessor
from .algorithms.rasterstats_algorithms import get_zonal_stats
from shapely.geometry import shape
from .algorithms.util import get_crs_from_cog, reproject

LOGGER = logging.getLogger(__name__)

#: Process metadata and description
PROCESS_METADATA = {
    "version": "0.1.0",
    "id": "zonal-statistics-rasterstats",
    "title": {
        "en": "Zonal statistics of a COG using rasterstats",
        "de": "Zonale Statistiken einer COG-Datei mit Hilfe von rasterstats",
    },
    "description": {
        "en": "Compute zonal statistics of a subset of a public accessible COG.",  # noqa: E501
        "de": "Berechnet zonale Statistiken eines öffentlich zugänglichen COGs.",  # noqa: E501
    },
    "keywords": ["rasterstats", "zonal statistics"],
    "links": [],
    "inputs": {
        "cogUrl": {
            "title": "The URL of the COG",
            "description": "The public available URL of the COG to query",
            "schema": {"type": "string"},
            "minOccurs": 1,
            "maxOccurs": 1,
        },
        "polygonGeoJson": {
            "title": "Polygon GeoJSON",
            "description": "A polygon GeoJSON for which to compute zonal statistics of the COG",  # noqa: E501
            "minOccurs": 1,
            "maxOccurs": 1,
            "schema": {
                "$ref": "http://schemas.opengis.net/ogcapi/features/part1/1.0/openapi/schemas/geometryGeoJSON.json"  # noqa: E501
            },
        },
        "statisticMethods": {
            "title": "Statistical Methods",
            "description": "The statistical methods to apply. Any out of:  ['count', 'min', 'max', 'mean', 'sum', 'std', 'median', 'majority', 'minority', 'unique', 'range', 'nodata', 'nan']",  # noqa: E501
            "maxOccurs": 1,
            "schema": {"type": "Array"},
        },
        "inputCrs": {
            "title": "Coordinate reference system",
            "description": "The coordinate reference system of the provided geometry",  # noqa: E501
            "schema": {"type": "string"},
            "minOccurs": 1,
            "maxOccurs": 1,
        },
        "returnGeoJson": {
            "title": "Return GeoJSON",
            "description": "If a GeoJSON shall be returned, including the provided the geometry.",  # noqa: E501
            "schema": {"type": "boolean"},
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
        "values": {"title": "TODO", "description": "TODO", "schema": {"type": "string"}}
    },
    "example": {
        "inputs": {
            "cogUrl": "https://example.com/sample-cog.tif",
            "statisticMethods": ["count", "majority"],
            "bands": [1, 2, 3],
            "polygonGeoJson": {
                "coordinates": [
                    [
                        [7.398378066263234, 50.35623617599114],
                        [7.398378066263234, 47.310703221840384],
                        [14.007896257545866, 47.310703221840384],
                        [14.007896257545866, 50.35623617599114],
                        [7.398378066263234, 50.35623617599114],
                    ]
                ],
                "type": "Polygon",
            },
        }
    },
}


class ZonalStatisticsRasterstatsProcessor(BaseProcessor):  # noqa: D101
    def __init__(self, processor_def):  # noqa: D107
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):  # noqa: D102
        cog_url = data.get("cogUrl")
        polygon_geojson = data.get("polygonGeoJson")
        input_crs = data.get("inputCrs")
        return_geojson = data.get("returnGeoJson")
        statistic_methods = data.get("statisticMethods") or [
            "count",
            "min",
            "mean",
            "max",
            "median",
        ]
        bands = data.get("bands") or [1]

        # TODO: ensure polygon is not too large,
        #       otherwise process takes very long or even crashes

        result = None
        polygon = shape(polygon_geojson)

        if input_crs is not None:
            if isinstance(input_crs, str) and input_crs.startswith("EPSG:"):
                cog_crs = get_crs_from_cog(cog_url)

                if input_crs != cog_crs:
                    polygon = reproject(polygon, input_crs, cog_crs)
                else:
                    # provided CRS by user is identical to COG
                    # no conversion needed
                    pass
            else:
                raise Exception(
                    "Provided CRS from user is not valid: {}".format(input_crs)
                )

        result = get_zonal_stats(
            cog_url, polygon, statistic_methods=statistic_methods, bands=bands
        )

        if return_geojson is True:
            geojson_feature = shapely.geometry.mapping(polygon)
            geojson_feature["properties"] = result[0]
            mimetype = "application/geo+json"
            return mimetype, geojson_feature
        else:
            mimetype = "application/json"
            outputs = {"values": result}
            return mimetype, outputs

    def __repr__(self):  # noqa: D105
        return "<ZonalStatisticsRasterstatsProcessor> {}".format(self.name)
