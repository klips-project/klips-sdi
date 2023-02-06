// The relative path to the URL of the respective OGC API Processes instance
const oapiProcessesUrl = "../processes/";

// The chosen Process ID
let processId = '';

// The OpenLayers Draw interaction
let olDraw;

// The EPSG code of Webmercator
const epsg3857 = 'EPSG:3857';

/**
 * Adjusts the app to one chosen process.
 *
 * @param {String} process The id/name of the process
 */
const setProcess = (process) => {
  // set global variable processId
  processId = process;
  map.removeInteraction(olDraw);
  let type = 'Polygon';
  if (process === 'location-info-rasterstats' || process === 'location-info-time-rasterstats') {
    type = 'Point';
  }
  olDraw = new ol.interaction.Draw({
    source: drawSource,
    type
  });
  map.addInteraction(olDraw);

  olDraw.on('drawstart', () => {
    drawSource.clear();
  });

  olDraw.on('drawend', (event) => {
    const feature3857 = event.feature;
    let x;
    let y;
    if (feature3857.getGeometry().getType() === 'Point') {
      x = feature3857.getGeometry().getCoordinates()[0]
      y = feature3857.getGeometry().getCoordinates()[1]
    }

    const formatGeoJson = new ol.format.GeoJSON({
      featureProjection: epsg3857
    });
    const geoJsonGeom = formatGeoJson.writeGeometry(feature3857.getGeometry());

    let payload;
    switch (processId) {
      case 'hello-world':
        payload = {
          inputs: {
            name: "Peter"
          }
        };
        break;
      case 'zonal-statistics-grass':
        payload = {
          inputs: {
            inputGeometries: [{
              value: JSON.parse(geoJsonGeom),
              mediaType: "application/geo+json"
            }],
            cogUrl: "http://nginx/cog/dresden_20220216T1146Z.tif"
          }
        };
        break;
      case 'zonal-statistics-rasterstats':
        payload = {
          inputs: {
            polygonGeoJson: JSON.parse(geoJsonGeom),
            cogUrl: "http://nginx/cog/dresden_20220216T1146Z.tif",
            statisticMethods: ['count', 'min', 'max', 'mean', 'sum', 'std', 'median', 'majority', 'minority', 'unique', 'range', 'nodata', 'nan']
          }
        };
        break;
      case 'zonal-statistics-time-rasterstats':
        payload = {
          inputs: {
            polygonGeoJson: JSON.parse(geoJsonGeom),
            inputCrs: epsg3857,
            cogDirUrl: "http://nginx/cog/dresden/dresden_temperature/",
            startTimeStamp: "2000-10-02T12:32:00Z",
            endTimeStamp: "2024-10-08T12:32:00Z"
          }
        };
        break;
      case 'location-info-rasterstats':
        payload = {
          inputs: {
            x: x,
            y: y,
            inputCrs: epsg3857,
            cogUrl: "http://nginx/cog/dresden/dresden_temperature/dresden_20221008T1232Z.tif"
          }
        };
        break;
      case 'location-info-time-rasterstats':
        payload = {
          inputs: {
            x: x,
            y: y,
            cogDirUrl: "http://nginx/cog/dresden/dresden_temperature/",
            inputCrs: epsg3857,
            startTimeStamp: "2000-01-01T12:32:00Z",
            endTimeStamp: "2024-12-31T12:32:00Z"
          }
        };
        break;
      default:
        console.error('unknown process: ', processId);
      }

    requestOapiProcesses(oapiProcessesUrl, payload)
  })
}

/**
 * Creates a chart from the results of a process.
 *
 * @param {Object} json The result of the process
 */
const setupChart = (json) => {
  const el = document.getElementById('chart');
  let chart = echarts.getInstanceByDom(el);
  if (!chart) {
    chart = echarts.init(el);
  }
  const option = {
    xAxis: {
      type: 'category',
      data: json.values.map(el => el.timestamp)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: json.values.map(el => el.band_0),
        type: 'line'
      }
    ]
  };
  chart.setOption(option);
}

fetch(oapiProcessesUrl + "?f=json")
    .then(response => response.json())
    .then(json => {
      const select =  document.querySelector('select[name=processes]');
      json.processes.forEach(p => {
        const option = document.createElement('option');
        option.innerHTML = p.title;
        option.value = p.id;
        select.appendChild(option);
      });
      select.onchange = (evt) => setProcess(evt.target.value);
      // trigger for first render
      setProcess(json.processes[0].id);
    })
    .catch(error => console.log('error', error));

const osmBasemap = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

const drawSource = new ol.source.Vector();
const drawLayer = new ol.layer.Vector({
  source: drawSource,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.7)',
    'stroke-color': 'black',
    'stroke-width': 4,
    'circle-radius': 7,
    'circle-fill-color': 'black',
  },
});


const map = new ol.Map({
  layers: [osmBasemap, drawLayer],
  target: 'map',
  view: new ol.View({
    center: [1528647, 6631453],
    zoom: 14
  }),
});

/**
 * Request a OGC API Process and display results.
 *
 * @param {String} url The URL of the OGC API Process
 * @param {Object} payload The payload to send to the process
 */
const requestOapiProcesses = (url, payload) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const requestOptions = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload),
    redirect: 'follow'
  };

  fetch(url + processId + '/execution', requestOptions)
    .then(response => response.json())
    .then(json => {
      const textBox = document.querySelector('#api-output');
      const html = `
      <h2>Process input</h2>
      <pre>${JSON.stringify(payload, null, 2)}</pre>
      <h2>Process output</h2>
      <pre>${JSON.stringify(json, null, 2)}</pre>
      `;
      textBox.innerHTML = html;
      if (processId === 'location-info-time-rasterstats') {
        setupChart(json);
      }
    })
    .catch(error => console.log('error', error));
}
