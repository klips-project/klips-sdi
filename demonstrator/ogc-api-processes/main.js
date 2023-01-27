const oapiProcessesUrl = "../processes/";
let processId = '';
let draw;

const setProcess = (process) => {
  processId = process;
  map.removeInteraction(draw);
  let type = 'Polygon';
  if (process === 'location-info-rasterstats' || process === 'location-info-time-rasterstats') {
    type = 'Point';
  }
  draw = new ol.interaction.Draw({
    source: source,
    type
  });
  map.addInteraction(draw);

  draw.on('drawstart', () => {
    source.clear();
  });
  
  draw.on('drawend', (event) => {
    const polygonFeature3857 = event.feature;
    let x;
    let y;
    if (polygonFeature3857.getGeometry().getType() === 'Point') {
      x = polygonFeature3857.getGeometry().getCoordinates()[0]
      y = polygonFeature3857.getGeometry().getCoordinates()[1]
    }

    const formatGeoJson = new ol.format.GeoJSON({
      featureProjection: 'EPSG:3857'
    });
    const geoJsonGeom = formatGeoJson.writeGeometry(polygonFeature3857.getGeometry());

    let payload;
    switch (processId) {
      case 'hello-world':
        payload = {
          "inputs": {
            "name": "Peter"
          }
        };
        break;
      case 'zonal-statistics-grass':
        payload = {
          "inputs": {
            "inputGeometries": [{
              "value": JSON.parse(geoJsonGeom),
              "mediaType": "application/geo+json"
            }]
          }
        };
        break;
      case 'zonal-statistics-rasterstats':
        payload = {
          "inputs": {
            "polygonGeoJson": JSON.parse(geoJsonGeom),
            "cogUrl": "http://nginx/cog/",
            "statisticMethods": ['count', 'min', 'max', 'mean', 'sum', 'std', 'median', 'majority', 'minority', 'unique', 'range', 'nodata', 'nan']
          }
        };
        break;
      case 'zonal-statistics-time-rasterstats':
        payload = {
          "inputs": {
            "polygonGeoJson": JSON.parse(geoJsonGeom),
            "cogDirUrl": "http://nginx/cog/",
            "startTimeStamp": "2000-10-02T12:32:00Z",
            "endTimeStamp": "2024-10-08T12:32:00Z",
            "statisticMethods": ['count', 'min', 'max', 'mean', 'sum', 'std', 'median', 'majority', 'minority', 'unique', 'range', 'nodata', 'nan']
          }
        };
        break;
      case 'location-info-rasterstats':
        payload = {
          "inputs": {
            "x": x,
            "y": y,
            "inputCrs": "EPSG:3857",
            "cogUrl": "http://nginx/cog/dresden_20220216T1146Z.tif"
          }
        };
        break;
      case 'location-info-time-rasterstats':
        payload = {
          "inputs": {
            "x": x,
            "y": y,
            "cogDirUrl": "http://nginx/cog/",
            "inputCrs": "EPSG:3857",
            "startTimeStamp": "2000-01-01T12:32:00Z",
            "endTimeStamp": "2024-12-31T12:32:00Z"
          }
        };
        break;
      default:
        console.error('unknown process: ', processId);
      }
  
    requestOapiProcesses(oapiProcessesUrl, payload)
  })
}

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

const raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

const source = new ol.source.Vector();
const vector = new ol.layer.Vector({
  source: source,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.2)',
    'stroke-color': 'black',
    'stroke-width': 4,
    'circle-radius': 7,
    'circle-fill-color': 'black',
  },
});


const map = new ol.Map({
  layers: [raster, vector],
  target: 'map',
  view: new ol.View({
    center: [1528647, 6631453],
    zoom: 14
  }),
});


const requestOapiProcesses = (url, payload) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify(payload);

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
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
