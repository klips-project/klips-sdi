import subprocess
import logging
from sys import flags
from grass.pygrass.modules.shortcuts import raster as r
from grass.pygrass.modules.shortcuts import general as g
from grass.pygrass.modules.shortcuts import vector as v
from grass.pygrass.modules import Module
import grass.script.setup as gsetup
from pygeoapi.process.base import BaseProcessor
import tempfile
import csv
import json

LOGGER = logging.getLogger(__name__)

PROCESS_METADATA = {
    'version': '0.0.1',
    'id': 'zonal-statistics-grass',
    'title': {
        'en': 'Zonal statistics with GRASS',
        'de': 'Zonale Statistik mit GRASS'
    },
    'description': {
        'en': 'Calculates zonal statistics using the GRASS module r.univar.',
        'de': 'Berechnet zonale Statistiken mit dem GRASS module r.univar.'
    },
    'keywords': ['zonal', 'statistics', 'raster'],
    'links': [],
    'example': {
        "inputs": {
            "inputGeometries": [
                {
                    "value": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [
                                    13.740481048705242,
                                    51.07277038077021
                                ],
                                [
                                    13.731125503661298,
                                    51.069210848003564
                                ],
                                [
                                    13.743141800048015,
                                    51.06489589578095
                                ],
                                [
                                    13.740481048705242,
                                    51.07277038077021
                                ]
                            ]
                        ]
                    },
                    "mediaType": "application/geo+json"
                }
            ]
        }
    },
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
                r.external(input='/demo_data/ecostress_4326.tif',
                    output=demo_raster_name, flags='e')
                # set region
                g.region(raster=demo_raster_name)

                # DEBUG: check if raster exists
                g.list(type='raster')

                for i, geom in enumerate(geoms):
                    jsonfile = f'{tempdir}/polygon{i}.json'
                    with open(jsonfile, 'w') as f:
                        f.write(json.dumps(geom))

                    polygon_name = 'polygon'
                    zone_name = 'zone'
                    output_file = f'{tempdir}/results'

                    v.external(input=jsonfile, output=polygon_name)
                    v.to_rast(input=polygon_name, output=zone_name,
                              use='val', value=i)
                    r.univar(map=demo_raster_name, zones=zone_name,
                             output=output_file, separator='comma', flags='t')

                    with open(output_file, 'r') as input:
                        for line in input:
                            output.write(line)

                    g.remove(type='vector', name=polygon_name, flags='f')
                    g.remove(type='raster', name=zone_name, flags='f')

                session.finish()
            with open(f'{tempdir}/output', 'r') as result:
                result = result.readlines()

            # format result to JSON
            # TODO: only works for one polygon and is a quick fix that should changed
            keys = []
            values = []
            with open(f'{tempdir}/output','r') as csvfile:
                csv_reader = csv.reader(csvfile, delimiter=',')
                i = 0
                for row in csv_reader:
                    if i == 0:
                        keys = row
                        i = i + 1
                    if i == 1:
                        values = row
            formatted_output = dict(zip(keys, values))

        outputs = {
            'result': result
        }

        outputs = formatted_output

        return mimetype, outputs

    def __repr__(self):
        return '<ZonalStatisticsGrassProcessor> {}'.format(self.name)
