import TextArea from "antd/lib/input/TextArea";
import { optionsBand, style } from "../../constants";
import { CopyOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Tooltip } from "antd";
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
    const [band, setBand] = useState('');
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
        const mailSubject = 'TODO: Change name';
        const mailBody = `Hey,\r\ncheck out the new widget:\r\n\r\n${url}`;

        const mailToUrl = new URL('mailto:');
        mailToUrl.searchParams.set('subject', mailSubject);
        mailToUrl.searchParams.set('body', mailBody);
        window.open(mailToUrl.toString().replace(/\+/g, '%20'), '_self');
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
                <SelectBand
                    inputBands={optionsBand}
                    changeBand={changeBand}
                    selectedBand={band}
                />
                <SelectThreshold
                    warning=""
                    changeThreshold={changeThreshold}
                />
            </div>
            <div className='permalink-component'>
                <h3>URL:</h3>
                <div className="permalink">
                    <TextArea
                        readOnly
                        value={url}
                    />
                    <Tooltip
                        title='Copy URL'
                    >
                        <Button
                            icon={<CopyOutlined />}
                            onClick={() => onCopyClickUrl(url)}
                            type='text'
                        />
                    </Tooltip>
                    <Tooltip
                        title='Mailto'>
                        <MailOutlined onClick={onMailClick} />
                    </Tooltip>
                    <TextArea
                        readOnly
                        value={`<iframe id="inlineFrameExample" title="Temperaturverlauf" width="90%" height="700px"
                        src="${url}">
                    </iframe>`}
                    />
                </div>
            </div>
        </>
    )
};

export default ChartComponent;








