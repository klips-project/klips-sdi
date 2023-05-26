import ffmpeg
import json
import requests
import tempfile
from argparse import ArgumentParser
from requests.models import PreparedRequest
from datetime import datetime, timedelta
from shapely import from_geojson, buffer
from .util import reproject
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw 

baseurl = "https://klips-dev.terrestris.de/geoserver/dresden/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&STYLES&LAYERS=dresden%3Adresden_temperature&exceptions=application%2Fvnd.ogc.se_inimage&SRS=EPSG%3A3035&"

# from timelapse_video import generate_timelapse_video
# generate_timelapse_video("dresden city", {"coordinates": [[[13.72209, 51.04663],[13.72209, 51.06487],[13.74577, 51.06487],[13.74577, 51.04663],[13.72209, 51.04663]]],"type": "Polygon"})
# fetch("http://localhost:5000/processes/timelapse-video/execution", {
#  "body": "{\"inputs\":{\"title\": \"Heat islands in Dresden Altstadt\", \"polygonGeoJson\": {\"coordinates\": [[[13.72242, 51.04242],[13.72242, 51.06019],[13.74525, 51.06019],[13.74525, 51.04242],[13.72242, 51.04242]]],\"type\": \"Polygon\"}}}",
#  "method": "POST"
#});
def generate_timelapse_video(title, geojson):
    """
    Create timelapse video for the given region.

    :param title: the title to render into the video
    :param geojson: A polygon GeoJSON indicating the area to render the video for
    :returns A timelapse video in webm format
    """
    # get current hour datetime
    now = datetime.now()
    nowFlattened = now.replace(minute=0, second=0, microsecond=0)
    with tempfile.TemporaryDirectory() as tempdir:
      try:
        geometry = from_geojson(json.dumps(geojson))
      except Exception as e:
        print("Failed to create geometry from geojson input.")
        raise Exception(e)
      
      # buffer feature and create bbox
      buffered = buffer(geometry, 0.005)
      # print("buffered geometry: ", buffered)
      buffered3035 = reproject(buffered, "EPSG:4326", "EPSG:3035")
      # print("reprojected buffered geometry: ", buffered3035)
      bbox = buffered3035.bounds
      # print("bbox of reprojected buffered geometry: ", bbox)

      # calculate width and height by determining aspect ratio of bbox
      xDistance = bbox[2] - bbox[0]
      yDistance = bbox[3] - bbox[1]
      ratio = xDistance / yDistance
      print("calculated aspect ratio: ", ratio)
      height = 512
      width = round(height * ratio)
      print("resulting width and height: ", width, height)
      
      # setup getmap urls and retrieve images
      for i in range(-48, 48):
        time = nowFlattened - timedelta(hours=i)
        timestring = time.isoformat() + 'Z'
        params = {
          'BBOX':','.join(str(x) for x in bbox),
          'WIDTH':width,
          'HEIGHT':height,
          'TIME': timestring
        }
        req = PreparedRequest()
        req.prepare_url(baseurl, params)
        print("fetching URL... ", req.url)
        response = requests.get(req.url)
        if response.status_code == 200:
          with open(f"{tempdir}/{timestring}.png", "wb") as f:
            f.write(response.content)
            try:
              image = Image.open(f"{tempdir}/{timestring}.png")
              # insert title into images
              if title is not None:
                ImageDraw.Draw(
                  image
                ).text(
                  (10, 10),  # Coordinates
                  title,  # Text
                  (0, 0, 0)  # Color
                )
              # insert datetime into images
              ImageDraw.Draw(
                image
              ).text(
                (10, height - 20),  # Coordinates
                timestring,  # Text
                (0, 0, 0)  # Color
              )
              image.save(f"{tempdir}/{timestring}.png")
            except Exception:
              print("Error on writing to image")
              pass

        else:
          print("Error on fetching URL: ", req.url)
          raise

      # create video
      print("Start video encoding")
      (
        ffmpeg
        .input(f"{tempdir}/*.png", pattern_type='glob', framerate=10)
        .output(f"{tempdir}/movie.mp4")
        .run()
      )
      print("Finished video encoding")
      
      # TODO check how to correctly return binary data through api
      with open(f"{tempdir}/movie.mp4", "r") as video:
        return video
