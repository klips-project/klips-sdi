import ffmpeg
import json
import requests
import os
from requests.models import PreparedRequest
from datetime import datetime, timedelta
from shapely import from_geojson, buffer
from .util import reproject
from PIL import Image, ImageFont, ImageDraw
from string import Template
from pygml.v32 import encode_v32
from lxml import etree

import logging

LOGGER = logging.getLogger(__name__)
url = os.environ["SERVER_URL"]
geoserverUrl = url + "/geoserver/dresden/wms?"
baseurl = (
    geoserverUrl
    + "SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&STYLES&LAYERS=dresden%3Adresden_temperature&exceptions=application%2Fvnd.ogc.se_inimage&SRS=EPSG%3A3035&"  # noqa: E501
)
cacheFolder = "/tmp/timelapse"

inlineFeatureGetMap = """<?xml version="1.0" encoding="UTF-8"?>
<ogc:GetMap xmlns:ogc="http://www.opengis.net/ows"
            xmlns:gml="http://www.opengis.net/gml"
   version="1.1.1" service="WMS">
   <sld:StyledLayerDescriptor xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
   xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:ogc="http://www.opengis.net/ogc"
   xmlns:sld="http://www.opengis.net/sld" version="1.0.0">
      <sld:UserLayer>
          <sld:Name>Inline</sld:Name>
          <sld:InlineFeature>
            <sld:FeatureCollection>
                <sld:featureMember>
                  <feature>
                    <geometryProperty>
                      <gml:Polygon >
                        <gml:outerBoundaryIs>
                           <gml:LinearRing>
                              <gml:coordinates>
                                $coordinates
                              </gml:coordinates>
                           </gml:LinearRing>
                        </gml:outerBoundaryIs>
                      </gml:Polygon>
                    </geometryProperty>
                    <title></title>
                  </feature>
                </sld:featureMember>
            </sld:FeatureCollection>
          </sld:InlineFeature>
          <sld:UserStyle>
            <sld:FeatureTypeStyle>
                <sld:Rule>
                  <sld:PolygonSymbolizer>
                    <Stroke>
                      <CssParameter name="stroke">#FF0000</CssParameter>
                      <CssParameter name="stroke-width">2</CssParameter>
                    </Stroke>
                  </sld:PolygonSymbolizer>
                </sld:Rule>
            </sld:FeatureTypeStyle>
          </sld:UserStyle>
      </sld:UserLayer>
    </sld:StyledLayerDescriptor>
   <BoundingBox srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">
      <gml:coord><gml:X>$llx</gml:X><gml:Y>$lly</gml:Y></gml:coord>
      <gml:coord><gml:X>$urx</gml:X><gml:Y>$ury</gml:Y></gml:coord>
   </BoundingBox>
   <Output>
      <Format>image/png</Format>
      <Transparent>true</Transparent>
      <Size><Width>$width</Width><Height>$height</Height></Size>
   </Output>
</ogc:GetMap>"""


def generate_timelapse_video(title, geojson):
    """
    Create timelapse video for the given region.

    :param title: the title to render into the video
    :param geojson: A polygon GeoJSON indicating the area to render the video for
    :returns A timelapse video in mp4 format
    """
    # get current hour datetime
    now = datetime.now()
    nowFlattened = now.replace(minute=0, second=0, microsecond=0)
    try:
        geometry = from_geojson(json.dumps(geojson))
    except Exception as e:
        LOGGER.error("Failed to create geometry from geojson input.")
        raise Exception(e)

    # buffer feature and create bbox
    buffered = buffer(geometry, 0.005)
    LOGGER.debug("buffered geometry: ", buffered)
    buffered3035 = reproject(buffered, "EPSG:4326", "EPSG:3035")
    LOGGER.debug("reprojected buffered geometry: ", buffered3035)
    bbox = buffered3035.bounds
    LOGGER.debug("bbox of reprojected buffered geometry: ", bbox)

    # check if we can deliver from cache
    targetFolder = f"{cacheFolder}/{nowFlattened.isoformat()}-" + "-".join(
        str(x) for x in bbox
    )
    if not os.path.exists(targetFolder):
        os.makedirs(targetFolder)
    targetFilename = "movie.mp4"
    target = os.path.join(targetFolder, targetFilename)
    LOGGER.debug("target:", target)
    if os.path.exists(target) is True:
        LOGGER.info("delivering video from cache... ", target)
        with open(target, "rb") as video:
            chunk = video.read()
            return chunk
    else:
        LOGGER.info("no cache found, generating video... ")

    # calculate width and height by determining aspect ratio of bbox
    xDistance = bbox[2] - bbox[0]
    yDistance = bbox[3] - bbox[1]
    ratio = xDistance / yDistance
    LOGGER.debug("calculated aspect ratio: ", ratio)
    height = 512
    width = round(height * ratio)
    LOGGER.debug("resulting width and height: ", width, height)

    # render user given geometry via geoserver sld inlinefeature
    gml = encode_v32(geojson, "ID")
    gmlString = etree.tostring(gml, pretty_print=True).decode()
    coordinates = gmlString.split("<gml:posList>")[1].split("</gml:posList>")[0]
    coordinates = coordinates.split(" ")
    coordinateString = ""
    for i in range(0, len(coordinates), 2):
        coordinateString += coordinates[i] + "," + coordinates[i + 1] + " "

    getMap = Template(inlineFeatureGetMap).substitute(
        llx=buffered.bounds[0],
        lly=buffered.bounds[1],
        urx=buffered.bounds[2],
        ury=buffered.bounds[3],
        width=width,
        height=height,
        coordinates=coordinateString,
    )
    headers = {"Content-Type": "application/xml; charset=UTF-8"}
    response = requests.post(geoserverUrl, getMap, headers)
    if response.status_code == 200:
        with open(f"{targetFolder}/geometry.png", "wb") as f:
            f.write(response.content)
        geometryImage = Image.open(f"{targetFolder}/geometry.png")
        geometryImage = geometryImage.convert("RGBA")

    # setup getmap urls and retrieve images
    for i in range(-48, 48):
        time = nowFlattened - timedelta(hours=i)
        timestring = time.isoformat() + "Z"
        params = {
            "BBOX": ",".join(str(x) for x in bbox),
            "WIDTH": width,
            "HEIGHT": height,
            "TIME": timestring,
        }
        req = PreparedRequest()
        req.prepare_url(baseurl, params)
        LOGGER.info("fetching URL... ", req.url)
        response = requests.get(req.url)
        if response.status_code == 200:
            with open(f"{targetFolder}/{timestring}.png", "wb") as f:
                f.write(response.content)
                try:
                    image = Image.open(f"{targetFolder}/{timestring}.png")
                    image = image.convert("RGBA")
                    fonts_path = os.path.join(
                        os.path.dirname(os.path.dirname(__file__)), "fonts"
                    )
                    font = ImageFont.truetype(
                        os.path.join(fonts_path, "OpenSans-Regular.ttf"), 16
                    )
                    # insert title into images
                    if title is not None:
                        ImageDraw.Draw(image).text((10, 10), title, (0, 0, 0), font)
                    # insert datetime into images
                    ImageDraw.Draw(image).text(
                        (10, height - 30),
                        time.strftime("%d.%m.%Y, %H:%M:%S"),
                        (0, 0, 0),
                        font,
                    )
                    # draw geometry provided by user ontop
                    if geometryImage is not None:
                        image = Image.alpha_composite(image, geometryImage)

                    image.save(f"{targetFolder}/{timestring}.png")
                except Exception:
                    LOGGER.error("Error on writing to image")
                    pass

        else:
            LOGGER.error("Error on fetching URL: ", req.url)
            raise

    # create video
    LOGGER.info("Start video encoding")
    (
        ffmpeg.input(f"{targetFolder}/*.png", pattern_type="glob", framerate=10)
        .output(target)
        .run()
    )
    LOGGER.info("Finished video encoding")

    with open(target, "rb") as video:
        chunk = video.read()
        return chunk
