"""Algorithms based on GRASS GIS."""

import os
import subprocess
import sys
import tempfile
import csv
import json
from argparse import ArgumentParser

# Prepare GRASS session
# cf. https://grasswiki.osgeo.org/wiki/GRASS_Python_Scripting_Library
# cf. https://grasswiki.osgeo.org/wiki/Working_with_GRASS_without_starting_it_explicitly  # noqa: E501
gisbase = subprocess.check_output(["grass", "--config", "path"], text=True).strip()

# Set GISBASE environment variable
os.environ["GISBASE"] = gisbase

# Python path: we ask GRASS GIS where its Python packages are
sys.path.append(
    subprocess.check_output(["grass", "--config", "python_path"], text=True).strip()
)

# GRASS imports must be after GRASS paths are set (order is important)
import grass.script.setup as gsetup  # noqa: E402
from grass.pygrass.modules.shortcuts import vector as v  # noqa: E402
from grass.pygrass.modules.shortcuts import raster as r  # noqa: E402
from grass.pygrass.modules.shortcuts import general as g  # noqa: E402


def generate_zonal_stats(rastermap, geometries, crs="EPSG:4326"):
    """
    Create zonal statistics from a COG using a single polygon as input.

    :param rastermap: the URL of the COG
    :param geometries: A dict structured as GeoJSON in same projection
                       as the COG
    :param crs: Coordinate reference system of input geodata. If not defined,
                EPSG:4326 is used.
    :returns A dict structured JSON containing the zonal statistics
            as properties
    """
    with tempfile.TemporaryDirectory() as tempdir:
        with open(f"{tempdir}/output", "w"):
            location = f"{tempdir}/grass"
            subprocess.run(["grass", "-c", crs, location, "-e"])
            session = gsetup.init(location)

            print("GRASS session initialized")

            demo_raster_name = "demo-raster"

            try:
                print("Try to load rastermap: " + rastermap)
                r.external(
                    input="/vsicurl/" + rastermap,
                    output=demo_raster_name,
                    flags="e",
                    verbose=True,
                    # TODO Use an input param here
                    band=1,
                )
            except Exception as e:
                print(f"Failed to load raster {rastermap}.")
                raise e

            # update region
            g.region(raster=demo_raster_name)

            # write tmp geojson
            jsonfile = f"{tempdir}/polygon.json"
            try:
                with open(jsonfile, "w") as f:
                    f.write(json.dumps(geometries))
            except Exception as e:
                print(e)
                raise e

            polygon_name = "polygon"
            zone_name = "zone"
            output_file = f"{tempdir}/results"

            # link tmp geojson, flag o = override projection check
            v.external(input=jsonfile, output=polygon_name, flags="o")

            # rasterize geojson
            v.to_rast(input=polygon_name, output=zone_name, use="val", value=1)
            # calculate and write statistics to output_file as table output
            r.univar(
                map=demo_raster_name,
                zones=zone_name,
                output=output_file,
                separator="comma",
                flags="t",
                overwrite=True,
            )

            g.remove(type="vector", name=polygon_name, flags="f")
            g.remove(type="raster", name=zone_name, flags="f")

            session.finish()
            with open(f"{tempdir}/results", "r") as result:
                result = result.readlines()

            # format result to JSON
            keys = []
            values = []
            with open(f"{tempdir}/results", "r") as csvfile:
                csv_reader = csv.reader(csvfile, delimiter=",")
                for rowNumber, row in enumerate(csv_reader):
                    # First csv row contains keys
                    if rowNumber == 0:
                        keys = row
                    else:
                        values.append(row)

                outputs = []
                for value in values:
                    outputs.append(dict(zip(keys, value)))

                return outputs


def main():
    """Test algorithms of this file."""
    parser = ArgumentParser()

    parser.add_argument(
        "-c", "--cog", dest="cog", help="Input COG URL", metavar="COG", type=str
    )
    parser.add_argument(
        "-g",
        "--geometries",
        dest="geometries",
        help="Geometries",
        metavar="GEOMETRIES",
        type=str,
    )

    args = parser.parse_args()

    with open(args.geometries) as geojson:
        try:
            results = generate_zonal_stats(
                rastermap=args.cog, geometries=json.load(geojson)
            )
            print(results)
        except Exception as e:
            print(e)


if __name__ == "__main__":
    main()
