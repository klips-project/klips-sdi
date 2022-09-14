import subprocess
import logging
from grass.pygrass.modules.shortcuts import raster as r
from grass.pygrass.modules.shortcuts import general as g
from grass.pygrass.modules.shortcuts import vector as v
from grass.pygrass.modules import Module
import grass.script.setup as gsetup
from pygeoapi.process.base import BaseProcessor
import tempfile
import json

LOGGER = logging.getLogger(__name__)

PROCESS_METADATA = {
    'version': '0.0.1',
    'id': 'zonal-statistics-grass',
    'title': {
        'en': 'Zonal statistics',
        'de': 'Zonale Statistik'
    },
    'description': {
        'en': 'Calculates zonal statistics',
        'de': 'Berechnet eine zonale Statisik'
    },
    'keywords': ['zonal', 'statistics', 'raster'],
    'links': [],
    'example': [],
    'inputs': {
        'inputGeometries': {
            'title': 'Input geometries',
            'description': 'Input zones encoded as GeoJSON geometries',
            'minOccurs': 1,
            'maxOccurs': 'unbounded',
            'schema': {
                '$ref': 'http://schemas.opengis.net/ogcapi/features/part1/1.0/openapi/schemas/geometryGeoJSON.json'
            }
        }
    },
    'outputs': {
        'statistics': {
            'title': 'Zonal statistics',
            'description': 'The zonal statistics',
            'schema': {
                'type': 'object',
                'contentMediaType': 'application/json'
            }
        }
    }
}


class ZonalStatisticsGrassProcessor(BaseProcessor):

    def __init__(self, processor_def):
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):
        geoms = data.get('inputGeometries', None)
        mimetype = 'application/json'

        result = None

        with tempfile.TemporaryDirectory() as tempdir:
            with open(f'{tempdir}/output', 'w') as output:
                location = f'{tempdir}/grass'
                subprocess.run(['grass', '-c', 'EPSG:4326',
                               location, '-e'])
                session = gsetup.init(location)

                demo_raster_name = 'demo-raster'
                # input raster must be in EPSG 4326
                r.in_gdal(input='/demo_data/ecostress_4326.tif',
                          output=demo_raster_name)

                # set region
                g.region(raster=demo_raster_name)

                # TODO: use r.external instead of r.gdal_in
                #       https://grass.osgeo.org/grass82/manuals/r.external.html

                # DEBUG: check if raster exists
                g.list(type='raster')

                for i, geom in enumerate(geoms):
                    jsonfile = f'{tempdir}/polygon{i}.json'
                    with open(jsonfile, 'w') as f:
                        f.write(json.dumps(geom))

                    polygon_name = 'polygon'
                    zone_name = 'zone'
                    output_dir = f'{tempdir}/results'

                    v.external(input=jsonfile, output=polygon_name)
                    v.to_rast(input=polygon_name, output=zone_name,
                              use='val', value=i)
                    r.univar(map=demo_raster_name, zones=zone_name,
                             output=output_dir, separator='comma', flags='t')

                    with open(output_dir, 'r') as input:
                        for line in input:
                            output.write(line)

                    g.remove(type='vector', name=polygon_name, flags='f')
                    g.remove(type='raster', name=zone_name, flags='f')

                session.finish()
            with open(f'{tempdir}/output', 'r') as result:
                result = result.readlines()

        outputs = {
            'result': result
        }

        return mimetype, outputs

    def __repr__(self):
        return '<ZonalStatisticsGrassProcessor> {}'.format(self.name)
