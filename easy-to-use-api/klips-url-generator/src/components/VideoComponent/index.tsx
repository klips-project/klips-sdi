import React, { useEffect, useState } from "react";
import { optionsVideoFormat, style } from "../../constants";
import TextArea from "antd/lib/input/TextArea";
import { Input, Tooltip } from "antd";
import { CopyOutlined, MailOutlined, PlusCircleOutlined } from '@ant-design/icons'
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
    const [videoFormat, setVideoFormat] = useState('mp4');
    const [personalTitle, setPersonalTitle] = useState('');

    useEffect(() => {
        if (region && geoJsonGeom && videoFormat && personalTitle) {
            setURL(`https://klips2024.terrestris.de/easy-to-use-api/timelapse-video/?region=${region.toLowerCase()}&area-of-interest=${geoJsonGeom}&output=${videoFormat}&title=${personalTitle}`)
        };
    }, [region, geoJsonGeom, videoFormat, personalTitle]);

    const changeVideoFormat = (newFormat: string) => {
        setVideoFormat(newFormat);
    };

    const changeTitle = (newTitle: string) => {
        setPersonalTitle(newTitle);
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
                        value={url ? `<iframe id="inlineFrameExample" title="Zeitraffer-Video" width="90%" height="700px" src="${url}"></iframe>` : ''}
                    />
                </div>
            </div>
        </div >
    );
};

export default VideoComponent;
