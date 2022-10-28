import os
import subprocess
import sys
import tempfile
import csv
import json
from argparse import ArgumentParser

gisbase = subprocess.check_output(["grass", "--config", "path"], text=True).strip()

os.environ['GISBASE'] = gisbase

sys.path.append(
    subprocess.check_output(["grass", "--config", "python_path"], text=True).strip()
)

# Import GRASS Python bindings
import grass.script.setup as gsetup
from grass.pygrass.modules.shortcuts import general as g
from grass.pygrass.modules.shortcuts import raster as r
from grass.pygrass.modules.shortcuts import vector as v


def generate_zonal_stats(rastermap, geometries):
    with tempfile.TemporaryDirectory() as tempdir:
        with open(f'{tempdir}/output', 'w') as output:
            location = f'{tempdir}/grass'
            subprocess.run(['grass', '-c', 'EPSG:4326',
                            location, '-e'])
            session = gsetup.init(location)

            demo_raster_name = 'demo-raster'

            g.list(type='raster')

            r.external(input='/vsicurl/' + rastermap,
               output=demo_raster_name, flags='e')

            # set region
            g.region(raster=demo_raster_name)

            for i, geom in enumerate(geometries):
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
        with open(f'{tempdir}/output', 'r') as csvfile:
            csv_reader = csv.reader(csvfile, delimiter=',')
            i = 0
            for row in csv_reader:
                if i == 0:
                    keys = row
                    i = i + 1
                if i == 1:
                    values = row
        formatted_output = dict(zip(keys, values))

    outputs = formatted_output

    return outputs


def main():
    parser = ArgumentParser()

    parser.add_argument("-c", "--cog", dest="cog",
                    help="Input COG URL", metavar="COG",
                    type=str)
    parser.add_argument("-g", "--geometries", dest="geometries",
                    help="Geometries", metavar="GEOMETRIES",
                    type=str)

    args = parser.parse_args()

    with open(args.geometries) as json_data:
        results = generate_zonal_stats(rastermap=args.cog, geometries=json.load(json_data))
        print(results)


if __name__ == '__main__':
    main()
