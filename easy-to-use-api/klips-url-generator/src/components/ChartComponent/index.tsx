import TextArea from "antd/lib/input/TextArea";
import { optionsBand, style } from "../../constants";
import { CopyOutlined, MailOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Input, Tooltip } from "antd";
import { onCopyClickGeom, onCopyClickUrl } from "../../service";
import { useEffect, useState } from "react";
import OlGeometry from 'ol/geom/Geometry';
import SelectBand from "../SelectBand";
import SelectThreshold from "../SelectThreshold";
import { DrawEvent as OlDrawEvent } from 'ol/interaction/Draw';
import DrawGeometry from "../DrawGeometry";


export interface ChartProps {
    geoJsonGeom: string,
    region: string;
    wktGeom: string;
    onDrawEnd?: (geom: OlGeometry) => void;
    onDrawStart?: (event: OlDrawEvent) => void;
};

export type ChartComponentProps = ChartProps;

const ChartComponent: React.FC<ChartComponentProps> = ({ geoJsonGeom, region, wktGeom, onDrawEnd, onDrawStart }) => {
    const [band, setBand] = useState('physical');
    const [threshold, setThreshold] = useState();
    const [url, setURL] = useState('');

    useEffect(() => {
        if (region && wktGeom && threshold && band) {
            setURL(`https://klips-dev.terrestris.de/easy-to-use-api/chart/?region=${region.toLowerCase()}&geom=${wktGeom}&threshold=${threshold}&band=${band}`)
        };
    }, [region, wktGeom, threshold, band]);

    const changeBand = (newBand: string) => {
        setBand(newBand);
    };

    const changeThreshold = (newThreshold: any) => {
        setThreshold(newThreshold);
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
                            <Button
                                icon={<CopyOutlined />}
                                onClick={() => onCopyClickGeom(geoJsonGeom)}
                                type='text'
                            />
                        </Tooltip>
                    </div>
                }
            </div>
            <div className='attributes'>
                <h3>Band:</h3>
                <SelectBand
                    inputBands={optionsBand}
                    changeBand={changeBand}
                    selectedBand={band}
                />
                <h3>Grenzwert:</h3>
                <SelectThreshold
                    changeThreshold={changeThreshold}
                />
            </div>
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
                    <TextArea
                        rows={4}
                        readOnly
                        value={url ? `<iframe id="inlineFrameExample" title="Temperaturverlauf" width="90%" height="700px" src="${url}"></iframe>`: ''}
                    />
                </div>
            </div>
        </>
    )
};

export default ChartComponent;








