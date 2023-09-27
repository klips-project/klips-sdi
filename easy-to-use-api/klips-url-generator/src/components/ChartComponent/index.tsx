import { useEffect, useState } from "react";

import { Button, Row, Tooltip } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { CopyOutlined } from '@ant-design/icons';

import OlGeometry from 'ol/geom/Geometry';
import { DrawEvent as OlDrawEvent } from 'ol/interaction/Draw';

import { optionsBand, style } from "../../constants";
import { onCopyClickGeom, onCopyClickUrl } from "../../service";

import DrawGeometry from "../DrawGeometry";
import SelectBand from "../SelectBand";
import SelectThreshold from "../SelectThreshold";

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

    return (
        <Row gutter={[0, 20]}>
            <Row gutter={[0, 5]} className='geometry' >
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
                    changeThreshold={changeThreshold}
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

export default ChartComponent;








