import React, { useEffect, useState } from "react";
import DrawGeometry from "../DrawGeometry";
import { optionsVideoFormat, style } from "../../constants";
import TextArea from "antd/lib/input/TextArea";
import { Button, Row, Tooltip } from "antd";
import { CopyOutlined } from '@ant-design/icons'
import { onCopyClickGeom, onCopyClickUrl } from "../../service";
import OlGeometry from 'ol/geom/Geometry';
import { DrawEvent as OlDrawEvent } from 'ol/interaction/Draw';
import SelectVideoFormat from "./SelectVideoFormat";
import WritePersonalTitle from "./WritePersonalTitle";

export interface VideoProps {
    geoJsonGeom: string,
    region: string;
    onDrawEnd?: (geom: OlGeometry) => void;
    onDrawStart?: (event: OlDrawEvent) => void;
};

export type VideoComponentProps = VideoProps;

const VideoComponent: React.FC<VideoComponentProps> = ({ onDrawEnd, onDrawStart, geoJsonGeom, region }) => {
    const [url, setURL] = useState('');
    const [videoFormat, setVideoFormat] = useState('');
    const [personalTitle, setPersonalTitle] = useState('');

    useEffect(() => {
        if (region && geoJsonGeom && videoFormat && personalTitle) {
            setURL(`https://klips-dev.terrestris.de/?region=${region.toLowerCase()}&area-of-interest=${geoJsonGeom}&output=${videoFormat}&title=${personalTitle}`)
        };
    }, [region, geoJsonGeom, videoFormat, personalTitle]);

    const changeVideoFormat = (newFormat: string) => {
        setVideoFormat(newFormat);
    };

    const changeTitle = (newTitle: string) => {
        setPersonalTitle(newTitle);
    };

    return (
        <Row gutter={[0, 20]} className='video-component'>
            <Row gutter={[0, 5]} className='geometry'>
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
                <SelectVideoFormat
                    selectedVideoFormat={videoFormat}
                    changeVideoFormat={changeVideoFormat}
                    inputVideoFormats={optionsVideoFormat}
                />
                <WritePersonalTitle
                    changeTitle={changeTitle}
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
        </Row >
    );
};

export default VideoComponent;
