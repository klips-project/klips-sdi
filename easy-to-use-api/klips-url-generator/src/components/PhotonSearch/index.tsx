import React, {
  useEffect,
  useState
} from 'react';

import OlVectorLayer from 'ol/layer/Vector.js';
import OlVectorSource from 'ol/source/Vector.js';
import OlFormatGeoJSON from 'ol/format/GeoJSON';
import * as olExtent from 'ol/extent';
import { unByKey } from 'ol/Observable';

import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil.js';
import Logger from '@terrestris/base-util/dist/Logger';

import useMap from '@terrestris/react-geo/dist/Hook/useMap';
import { AutoComplete } from 'antd';
import { style } from '../../constants'
import { Feature, FeatureCollection, Geometry } from 'geojson';
import { DefaultOptionType } from 'antd/lib/select';

export type PhotonProperties = {
  osm_id?: number;
  extent?: [number, number, number, number];
  country?: string;
  county?: string;
  city?: string;
  postcode?: string;
  type?: string;
  osm_type?: string;
  osm_key?: string;
  district?: string;
  osm_value?: string;
  name?: string;
  state?: string;
  countrycode?: string;
  locality?: string;
  housenumber?: string;
  street?: string;
};

export type PhotonFeatureCollection = FeatureCollection<Geometry, PhotonProperties>;

export type PhotonOptionType = {
  feature: Feature<Geometry, PhotonProperties>;
} & DefaultOptionType;

export const PhotonSearch: React.FC = (
): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dataSource, setDataSource] = useState<PhotonFeatureCollection>();
  const [bbox, setBbox] = useState<olExtent.Extent | undefined>();

  const map = useMap();

  useEffect(() => {
    if (!map) {
      return;
    }

    const bboxLayer = MapUtil.getLayerByName(map, 'BboxLayer') as OlVectorLayer<OlVectorSource>;
    let bbox;

    const key = bboxLayer.getSource()?.on('addfeature', olEvt => {
      bbox = olEvt.feature?.clone().getGeometry()?.transform('EPSG:3857', 'EPSG:4326').getExtent();

      if (!bbox) {
        return;
      }

      setBbox(bbox)
    });

    return () => {
      if (!key) {
        return;
      }

      unByKey(key);
    };
  }, [map]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`https://photon.komoot.io/api?q=${searchTerm}&bbox=${bbox?.toString()}`);

      if (!response.ok) {
        new Error(`Return code: ${response.status}`);
      }

      const responseJson = await response.json() as PhotonFeatureCollection;
      setDataSource(responseJson);
    }

    try {
      if (!searchTerm || !bbox) {
        return;
      }

      fetchData();
    } catch (error) {
      Logger.error(`Error while requesting photon: ${error}`);
    }

  }, [bbox, searchTerm])

  const createOptions = () => {
    if (!dataSource || !dataSource.features) {
      return [];
    }

    return dataSource.features.map((f, index) => ({
      label: (
        <div className='search-result-selection'>
          <h2 className='search-result-name'>
            {f.properties.name}
          </h2>
          <p className='search-result-property'>
            {f.properties?.street} {f.properties?.housenumber}
          </p>
          <p>
            {f.properties?.postcode} {f.properties?.city} {f.properties?.countrycode}
          </p>
        </div>
      ),
      value: `${f.properties?.name}`,
      feature: f,
      key: index
    }));
  };

  const onSelect = (value: any, option: PhotonOptionType) => {
    if (!map) {
      return;
    }

    const format = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: map.getView().getProjection()
    });

    if (!option.feature || !bbox || !value) {
      return;
    }
    const olFeature = format.readFeature(option?.feature);

    // Ensures a valid request after switching the bbox
    if (olFeature.getGeometry()?.intersectsExtent(bbox)) {
      return;
    }

    let vectorLayer = MapUtil.getLayerByName(map, 'SearchResults') as OlVectorLayer<OlVectorSource>;
    if (!vectorLayer) {
      vectorLayer = new OlVectorLayer({
        source: new OlVectorSource(),
        style: style.searchFeature,
      });
      vectorLayer.set('name', 'SearchResults');
      map?.addLayer(vectorLayer);
    };

    vectorLayer.getSource()?.clear();
    vectorLayer.getSource()?.addFeature(olFeature);

    const geometry = olFeature.getGeometry();

    if (!geometry) {
      return;
    }

    map.getView().fit(geometry.getExtent(), {
      duration: 500,
      maxZoom: 17
    });
  };


  return (
    <div className='search-bar'>
      <h3>Suche:</h3>
      <AutoComplete<string, PhotonOptionType>
        className='search-bar'
        onChange={setSearchTerm}
        options={createOptions()}
        placeholder={'Ortsname, Straßenname, Stadtteilname, POI usw.'}
        onSelect={onSelect}
        allowClear={true}
        notFoundContent={'Keine Suchtreffer gefunden'}
      />
    </div>
  );
};

export default PhotonSearch;
