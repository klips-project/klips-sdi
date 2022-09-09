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
    'id': 'zonal-statistics',
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

class ZonalStatisticsProcessor(BaseProcessor):

    def __init__(self, processor_def):
        super().__init__(processor_def, PROCESS_METADATA)

    def execute(self, data):
        geoms = data.get('inputGeometries', None)
        mimetype = 'application/json'

        i = 0
        result = None

        with tempfile.TemporaryDirectory() as tempdir:
            with open(f'{tempdir}/output', 'w') as output:
                subprocess.run(['grass', '-c', 'EPSG:4326', f'{tempdir}/grass', '-e'])
                session = gsetup.init(f'{tempdir}/grass/')

                r.in_gdal(input = '/opt/geoserver_data/sample.tif', output = 'raster')
                for geom in geoms:
                    jsonfile = f'{tempdir}/polygon{i}.json'
                    with open(jsonfile, 'w') as f:
                        f.write(json.dumps(geom))
                    i = i + 1
                    v.external(input = jsonfile, output = 'polygon')
                    v.to_rast(input = 'polygon', output = 'zone', use = 'val', value = i)
                    r.univar(map = 'raster', zones = 'zone', output = f'{tempdir}/results', separator = 'comma', flags = 't')
                    with open(f'{tempdir}/results', 'r') as input:
                        for line in input:
                            output.write(line)
                    g.remove(type = 'vector', name = 'polygon')
                    g.remove(type = 'raster', name = 'zone')

                session.finish()
            with open(f'{tempdir}/output', 'r') as result:
                result = result.readlines()

        outputs = {
            'id': 'statistics',
            'value': {
                'id': 'test',
                'result': result
            }
        }

        return mimetype, outputs

    def __repr__(self):
        return '<ZonalStatisticsProcessor> {}'.format(self.name)
