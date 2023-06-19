// The relative path to the URL of the respective OGC API Processes instance
const oapiProcessesUrl = "../processes/";

// The chosen Process ID
let processId = '';

// The OpenLayers Draw interaction
let olDraw;

// apply the projection definition for EPSG:3035
proj4.defs('EPSG:3035', '+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 ' +
  '+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
ol.proj.proj4.register(proj4);

// setting up the channel sliders
let minValue = 0;
let maxValue = 56;
let channel1Active = true;
let channel2Active = false;
let channel3Active = false;
const origin = window.location.origin.includes('localhost') ?
  'http://localhost:81' :
  window.location.origin;
const tiffBaseUrl = origin + '/cog/dresden/dresden_temperature/';
let tiffFileName = 'dresden_20230510T0600Z.tif';
let tiffUrl = tiffBaseUrl + tiffFileName;
const minSlider = document.querySelector("input[id=min]");
const maxSlider = document.querySelector("input[id=max]");
const cb1 = document.querySelector("input[id=channel1]");
const cb2 = document.querySelector("input[id=channel2]");
const cb3 = document.querySelector("input[id=channel3]");

const createTiffSource = () => {
  const bands = [];
  channel1Active ? bands.push(1) : null;
  channel2Active ? bands.push(2) : null;
  channel3Active ? bands.push(3) : null;
  return new ol.source.GeoTIFF({
    sources: [{
      bands,
      min: minValue,
      max: maxValue,
      nodata: -9999,
      url: tiffUrl,
      attributions: ["HHI"]
    }]
  })
};

minSlider.addEventListener('input', (evt) => {
  minValue = evt.target.value;
  tiffLayer.setSource(createTiffSource());
});
maxSlider.addEventListener('input', (evt) => {
  maxValue = evt.target.value;
  tiffLayer.setSource(createTiffSource());
});
cb1.addEventListener('change', (evt) => {
  channel1Active = evt.target.value === 'on';
  tiffLayer.setSource(createTiffSource());
});
cb2.addEventListener('change', (evt) => {
  channel2Active = evt.target.value === 'on';
  tiffLayer.setSource(createTiffSource());
});
cb3.addEventListener('change', (evt) => {
  channel3Active = evt.target.value === 'on';
  tiffLayer.setSource(createTiffSource());
});

/**
 * Adjusts the app to one chosen process.
 *
 * @param {String} process The id/name of the process
 */
const setProcess = (process) => {
  // set global variable processId
  processId = process;
  if (olDraw) {
    map.removeInteraction(olDraw);
  }
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
    const feature = event.feature;
    let x;
    let y;
    if (feature.getGeometry().getType() === 'Point') {
      x = feature.getGeometry().getCoordinates()[0]
      y = feature.getGeometry().getCoordinates()[1]
    }

    const formatGeoJson = new ol.format.GeoJSON({
      featureProjection: 'EPSG:3035'
    });
    const geoJsonGeom = formatGeoJson.writeGeometry(feature.getGeometry());

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
            polygonGeoJson: JSON.parse(geoJsonGeom),
            cogUrl: "http://nginx/cog/dresden/dresden_temperature/" + tiffFileName,
            inputCrs: "EPSG:4326"
          }
        };
        break;
      case 'zonal-statistics-rasterstats':
        payload = {
          inputs: {
            polygonGeoJson: JSON.parse(geoJsonGeom),
            cogUrl: "http://nginx/cog/dresden/dresden_temperature/" + tiffFileName,
            statisticMethods: ['count', 'min', 'max', 'mean', 'sum', 'std', 'median', 'majority', 'minority', 'unique', 'range', 'nodata', 'nan']
          }
        };
        break;
      case 'zonal-statistics-time-rasterstats':
        payload = {
          inputs: {
            polygonGeoJson: JSON.parse(geoJsonGeom),
            inputCrs: 'EPSG:4326',
            cogDirUrl: "http://nginx/cog/dresden/dresden_temperature/",
            startTimeStamp: "2000-10-02T12:32:00Z",
            endTimeStamp: "2024-10-08T12:32:00Z",
            statisticMethods: ['count', 'min', 'max', 'mean', 'sum', 'std', 'median', 'majority', 'minority', 'unique', 'range', 'nodata', 'nan']
          }
        };
        break;
      case 'location-info-rasterstats':
        payload = {
          inputs: {
            x: x,
            y: y,
            inputCrs: 'EPSG:3035',
            cogUrl: "http://nginx/cog/dresden/dresden_temperature/" + tiffFileName
          }
        };
        break;
      case 'location-info-time-rasterstats':
        payload = {
          inputs: {
            x: x,
            y: y,
            cogDirUrl: "http://nginx/cog/dresden/dresden_temperature/",
            inputCrs: 'EPSG:3035',
            startTimeStamp: "2000-01-01T12:32:00Z",
            endTimeStamp: "2024-12-31T12:32:00Z"
          }
        };
      case 'timelapse-video':
        payload = {
          inputs: {
            polygonGeoJson: JSON.parse(geoJsonGeom),
            inputCrs: 'EPSG:3035',
            title: 'my test video'
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

// get all processes
fetch(oapiProcessesUrl + "?f=json")
  .then(response => response.json())
  .then(json => {
    const select = document.querySelector('select[name=processes]');
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

// get all datasets
fetch(tiffBaseUrl)
  .then(response => response.json())
  .then(json => {
    const select = document.querySelector('select[name=dataset]');
    json.filter(d => d.name.endsWith('.tif')).forEach(d => {
      const option = document.createElement('option');
      option.innerHTML = d.name;
      option.value = d.name;
      select.appendChild(option);
    });
    select.onchange = (evt) => {
      tiffFileName = evt.target.value;
      tiffUrl = tiffBaseUrl + tiffFileName;
      tiffLayer.setSource(createTiffSource());
    };
  })
  .catch(error => console.log('error', error));

const osmBasemap = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

const tiffLayer = new ol.layer.WebGLTile({
  source: createTiffSource(),
  attributions: ["HHI"]
});

const drawSource = new ol.source.Vector();
const drawLayer = new ol.layer.Vector({
  source: drawSource,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.7)',
    'stroke-color': '#e55f25',
    'stroke-width': 4,
    'circle-radius': 7,
    'circle-fill-color': '#e55f25',
  },
});

const map = new ol.Map({
  layers: [osmBasemap, tiffLayer, drawLayer],
  target: 'map',
  view: new ol.View({
    projection: 'EPSG:3035',
    center: [4585363.5883901585, 3112821.319358871],
    zoom: 12
  })
});

window.map = map;
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

  if (processId === 'timelapse-video') {
    const outputDiv = document.querySelector('#api-output');
    outputDiv.innerHTML = `
      <h2>Process input</h2>
      <pre>${JSON.stringify(payload, null, 2)}</pre>
      <h2>Process output</h2>
    `;
    const loadMsg = document.createElement('p');
    loadMsg.innerHTML = 'Please wait while the video is loading...';
    outputDiv.appendChild(loadMsg);
    const video = document.createElement('video');
    video.type = 'video/mp4';
    video.setAttribute('controls', '');
    outputDiv.appendChild(video);
    fetch(url + processId + '/execution', requestOptions)
      .then(response => response.blob())
      .then(blob => {
        loadMsg.innerHTML = '';
        const videoUrl = URL.createObjectURL(blob);
        video.src = videoUrl;
      });
    return;
  }

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

// Add Imprint
const toggleImprint = function () {
  const imprint = document.querySelector("#imprint");
  if (!imprint) {
    return;
  }
  imprint.classList.toggle("open");
};

document.querySelector("#imprintButton").onclick = toggleImprint;
document.querySelector("#closeModal").onclick = toggleImprint;

// Add Information modal
// load text using fetch, import json assertion won't work on Firefox
window.onload = async () => {
  let imprintText;
  try {
    const resp = await fetch('imprint.json');
    if (!resp.ok) {
      throw new Error("Could not fetch imprint data");
    }
    imprintText = await resp.json();

  } catch (error) {
    console.log(error);
  }
 
  const uhiTitleElement = document.querySelector("#uhi-title");
  const uhiTextElement = document.querySelector("#uhi-text");
  if (uhiTextElement && uhiTextElement) {
    uhiTitleElement.innerHTML = imprintText.de.uhi.title;
    uhiTextElement.innerHTML = imprintText.de.uhi.text;
  }

  const heatIndexTitleElement = document.querySelector("#heatIndex-title");
  const heatIndexTextElement = document.querySelector("#heatIndex-text");
  if (heatIndexTextElement && heatIndexTextElement) {
    heatIndexTitleElement.innerHTML = imprintText.de.heatIndex.title;
    heatIndexTextElement.innerHTML = imprintText.de.heatIndex.text;
  }

  // Language Switcher
  const languageButton = document.querySelector("#language");

  const toggleLanguage = function (event) {
    let languageKey



    if (languageButton.innerHTML == 'Deutsch') {
      languageKey = event.target.classList[0];
      languageButton.innerHTML = 'English'
    } else if (languageButton.innerHTML == 'English') {
      languageKey = event.target.classList[1];
      languageButton.innerHTML = 'Deutsch'
    }

    if (!languageKey) {
      return
    } else {
      heatIndexTitleElement.innerHTML = imprintText[languageKey].heatIndex.title;
      uhiTitleElement.innerHTML = imprintText[languageKey].uhi.title;
      heatIndexTextElement.innerHTML = imprintText[languageKey].heatIndex.text;
      uhiTextElement.innerHTML = imprintText[languageKey].uhi.text;
    };

  };
  languageButton.onclick = toggleLanguage;
}


// Ass Info
const toggleInfo = function () {
  const info = document.querySelector("#info");
  if (!info) {
    return;
  }
  info.classList.toggle("open");
};

document.querySelector("#infoButton").onclick = toggleInfo;
document.querySelector("#closeInfo").onclick = toggleInfo;