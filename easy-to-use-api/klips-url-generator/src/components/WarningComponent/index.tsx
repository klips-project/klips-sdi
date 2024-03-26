import TextArea from "antd/lib/input/TextArea";
import { optionsBand, style } from "../../constants";
import { CopyOutlined, MailOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Input, Tooltip } from "antd";
import { onCopyClickGeom, onCopyClickUrl } from "../../service";
import { useEffect, useState } from "react";
import OlGeometry from 'ol/geom/Geometry';
import SelectBand from "../SelectBand";
import SelectThreshold from "../SelectThreshold";
import { DrawEvent as OlDrawEvent } from 'ol/interaction/Draw';
import DrawGeometry from "../DrawGeometry";
import SelectInfo from "../SelectInfo";

export type Threshold = {
  green: String,
  orange: String,
  red: String
}

export interface WarningProps {
  geoJsonGeom: string,
  region: string;
  wktGeom: string;
  onDrawEnd?: (geom: OlGeometry) => void;
  onDrawStart?: (event: OlDrawEvent) => void;
};

export type WarningComponentProps = WarningProps;

const WarningComponent: React.FC<WarningComponentProps> = ({ geoJsonGeom, region, wktGeom, onDrawEnd, onDrawStart }) => {
  const [band, setBand] = useState('physical');
  const [threshold, setThreshold] = useState<Threshold>({ green: '0', orange: '30', red: '35' });
  const [url, setURL] = useState('');
  const [info, setInfo] = useState<string>('info-board');

  useEffect(() => {
    if (region && wktGeom && threshold && band) {
      setURL(`https://klips2024.terrestris.de/easy-to-use-api/warning/?region=${region.toLowerCase()}&geom=${wktGeom}&thresholdgreen=${threshold.green}&thresholdorange=${threshold.orange}&thresholdred=${threshold.red}&band=${band}&format=${info}`)
    };
  }, [region, wktGeom, threshold, band, info]);

  const changeBand = (newBand: string) => {
    setBand(newBand);
  };

  const changeInfo = (newInfo: string) => {
    setInfo(newInfo);
  };

  const changeThreshold = (key: keyof Threshold) => (newThreshold: string) => {
    let newState = {
      ...threshold
    };

    newState[key] = newThreshold;

    setThreshold(newState);
  };

  const onMailClick = () => {
    if (!url) {
      return;
    }
    const mailSubject = 'Widget-URL';
    const mailBody = `Hey,\r\nnutz doch diese URL für das Widget:\r\n\r\n${url}`;

    const mailToUrl = new URL('mailto:');
    mailToUrl.searchParams.set('subject', mailSubject);
    mailToUrl.searchParams.set('body', mailBody);
    window.open(mailToUrl.toString().replace(/\+/g, '%20'), '_self');
  }

  const onTabClick = () => {
    if (!url) {
      return;
    }
    window.open(url, url)
  }

  return (
    <>
      <div className='geometry'>
        <h3>Geometrie:</h3>
        <div className='geometry-button'>
          <DrawGeometry
            drawType='Point'
            drawStyle={style.point}
            onDrawEnd={onDrawEnd}
            onDrawStart={onDrawStart}
          />
          <DrawGeometry
            drawType='Polygon'
            drawStyle={style.polygon}
            onDrawEnd={onDrawEnd}
            onDrawStart={onDrawStart}
          />
        </div>
        {!geoJsonGeom ? <></> :
          <div className='geom-textarea'>
            <TextArea
              readOnly
              value={geoJsonGeom}
            />
            <Tooltip
              title='Copy GeoJSON'
            >
              <CopyOutlined onClick={() => onCopyClickGeom(geoJsonGeom)} />
            </Tooltip>
          </div>
        }
      </div>
      <div className='attributes'>
        <h3>Band:</h3>
        <SelectBand
          inputBands={optionsBand.slice(0, -1)}
          changeBand={changeBand}
          selectedBand={band}
        />
        <h3>Grenzwert:</h3>
        <h4>Grüne Warnung:</h4>
        <SelectThreshold
          changeThreshold={changeThreshold('green')}
        />
        <h4>Orangene Warnung:</h4>
        <SelectThreshold
          changeThreshold={changeThreshold('orange')}
        />
        <h4>Rote Warnung:</h4>
        <SelectThreshold
          changeThreshold={changeThreshold('red')}
        />
      </div>
      <SelectInfo
        selectedInfo={info}
        changeInfo={changeInfo}
      />
      <div className='permalink-component'>
        <h3>URL:</h3>
        <div className="permalink">
          <Input
            readOnly
            value={url}
          />
          <div className="url-icons">
            <Tooltip
              title='URL in Zwischenablage Kopieren'>
              <CopyOutlined onClick={() => onCopyClickUrl(url)} />
            </Tooltip>
            <Tooltip
              title='URL als E-Mail versenden'>
              <MailOutlined onClick={onMailClick} />
            </Tooltip>
            <Tooltip
              title='URL in einem neuen Tab öffnen'>
              <PlusCircleOutlined onClick={onTabClick} />
            </Tooltip>
          </div>
          <h3>IFrame:</h3>
          <TextArea
            rows={4}
            readOnly
            value={url ? `<iframe id="inlineFrameExample" title="Warnung" width="90%" height="700px" src="${url}"></iframe>` : ''}
          />
        </div>
      </div>
    </>
  )
};

export default WarningComponent;








