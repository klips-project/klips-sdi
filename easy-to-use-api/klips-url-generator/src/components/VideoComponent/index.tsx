import React, { useEffect, useState } from "react";
import { optionsVideoFormat, style } from "../../constants";
import TextArea from "antd/lib/input/TextArea";
import { Button, Input, Tooltip } from "antd";
import { CopyOutlined } from '@ant-design/icons'
import { onCopyClickGeom, onCopyClickUrl } from "../../service";
import OlGeometry from 'ol/geom/Geometry';
import { DrawEvent as OlDrawEvent } from 'ol/interaction/Draw';
import SelectVideoFormat from "./SelectVideoFormat";
import WritePersonalTitle from "./WritePersonalTitle";
import DrawGeometry from "../DrawGeometry";

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
            setURL(`https://klips-dev.terrestris.de/easy-to-use-api/timelapse-video/?region=${region.toLowerCase()}&area-of-interest=${geoJsonGeom}&output=${videoFormat}&title=${personalTitle}`)
        };
    }, [region, geoJsonGeom, videoFormat, personalTitle]);

    const changeVideoFormat = (newFormat: string) => {
        setVideoFormat(newFormat);
    };

    const changeTitle = (newTitle: string) => {
        setPersonalTitle(newTitle);
    };

    return (
        <div className='video-component'>
            <div className='geometry'>
                <h3>Geometrie:</h3>
                <div className='geometry-button'>
                    <DrawGeometry
                        drawType='Polygon'
                        drawStyle={style.polygon}
                        onDrawEnd={onDrawEnd}
                        onDrawStart={onDrawStart}
                    />
                </div>
                {!geoJsonGeom ? <></> :
                    <div>
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
                <SelectVideoFormat
                    selectedVideoFormat={videoFormat}
                    changeVideoFormat={changeVideoFormat}
                    inputVideoFormats={optionsVideoFormat}
                />
                <WritePersonalTitle
                    changeTitle={changeTitle}
                />
            </div>
            <div className='permalink-component'>
                <h3>URL:</h3>
                <div className="permalink">
                    <Input
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
                </div>
            </div>
        </div >
    );
};

export default VideoComponent;
