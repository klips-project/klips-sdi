import TextArea from "antd/lib/input/TextArea";
import { optionsBand, style } from "../../constants";
import DrawGeometry from "../DrawGeometry";
import { CopyOutlined } from '@ant-design/icons';
import { Button, Row, Tooltip } from "antd";
import { onCopyClickGeom, onCopyClickUrl } from "../../service";
import { useEffect, useState } from "react";
import OlGeometry from 'ol/geom/Geometry';
import SelectBand from "../SelectBand";
import SelectThreshold from "../SelectThreshold";
import { DrawEvent as OlDrawEvent } from 'ol/interaction/Draw';

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
    const [band, setBand] = useState('');
    const [threshold, setThreshold] = useState<Threshold>({ green: '0', orange: '30', red: '35' });
    const [url, setURL] = useState('');

    useEffect(() => {
        if (region && wktGeom && threshold && band) {
            setURL(`https://klips-dev.terrestris.de/?region=${region.toLowerCase()}&geom=${wktGeom}&thresholdgreen=${threshold.green}&thresholdorange=${threshold.orange}&thresholdred=${threshold.red}&band=${band}`)
        };
    }, [region, wktGeom, threshold, band]);

    const changeBand = (newBand: string) => {
        setBand(newBand);
    };

    const changeThreshold = (key: keyof Threshold) => (newThreshold: string) => {
        let newState = {
            ...threshold
        };

        newState[key] = newThreshold;

        setThreshold(newState);
    };

    return (
        <Row gutter={[0, 20]}>
            <Row gutter={[0, 5]} className='geometry'>
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
                {!geoJsonGeom ? <></> :
                    <div className='permalink'>
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
            </Row>
            <Row gutter={[0, 10]} className='attributes'>
                <SelectBand
                    inputBands={optionsBand}
                    changeBand={changeBand}
                    selectedBand={band}
                />
                <SelectThreshold
                    changeThreshold={changeThreshold('green')}
                />
                <SelectThreshold
                    changeThreshold={changeThreshold('orange')}
                />
                <SelectThreshold
                    changeThreshold={changeThreshold('red')}
                />
            </Row>
            <div className='permalink'>
                <TextArea
                    readOnly
                    value={url}
                />
                <Tooltip
                    title='Copy GeoJSON'
                >
                    <Button
                        icon={<CopyOutlined />}
                        onClick={() => onCopyClickUrl(url)}
                        type='text'
                    />
                </Tooltip>
            </div>
        </Row>
    )
};

export default WarningComponent;








