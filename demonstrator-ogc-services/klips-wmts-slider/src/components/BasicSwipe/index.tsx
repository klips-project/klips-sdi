import React, { useState } from 'react';
import useMap from '@terrestris/react-geo/dist/Hook/useMap';

import './index.less';
import { Button, Slider } from 'antd';
import { getRenderPixel } from 'ol/render';
import RenderEvent from 'ol/render/Event';


export const BasicSwipe: React.FC = (): JSX.Element => {
    const [value, setValue] = useState<number>(0);
    const [labelPositionRight, setLabelPositionRight] = useState<string>('0px');
    const [labelPositionLeft, setLabelPositionLeft] = useState<string>('0px');

    const map = useMap();

    if (!map) {
        return <></>;
    };

    const layerRight = map.getAllLayers()[2];
    const layerLeft = map.getAllLayers()[1];

    layerRight.on('prerender', function (event: RenderEvent) {
        const mapSize = map.getSize(); // [width, height] in CSS pixels

        if (!mapSize) {
            return <></>;
        };

        // get render coordinates and dimensions given CSS coordinates
        const width = Math.round(mapSize[0] * (value / 100));
        setLabelPositionLeft(`${width}px`);
        setLabelPositionRight(`${150-width}px`);

        const bottomLeft = getRenderPixel(event, [width, mapSize[1]]);
        const topLeft = getRenderPixel(event, [width, 0]);
        const topRight = getRenderPixel(event, [mapSize[0], 0]);
        const bottomRight = getRenderPixel(event, mapSize);

        const context = event.context as CanvasRenderingContext2D;

        if (!context) {
            return <></>;
        };

        context.restore();

        context.save();
        context.beginPath();
        context.moveTo(topRight[0], topRight[1]);
        context.lineTo(bottomRight[0], bottomRight[1]);
        context.lineTo(bottomLeft[0], bottomLeft[1]);
        context.lineTo(topLeft[0], topLeft[1]);
        context.closePath();
        context.clip();
    });

    layerLeft.on('prerender', function (event: RenderEvent) {
        const mapSize = map.getSize(); // [width, height] in CSS pixels

        if (!mapSize) {
            return <></>;
        };

        // get render coordinates and dimensions given CSS coordinates
        const width = Math.round(mapSize[0] * (value / 100));

        const bottomLeft = getRenderPixel(event, [0, mapSize[1]]);
        const topLeft = getRenderPixel(event, [0, 0]);
        const topRight = getRenderPixel(event, [width, 0]);
        const bottomRight = getRenderPixel(event, [width, mapSize[1]]);

        const context = event.context as CanvasRenderingContext2D;

        if (!context) {
            return <></>;
        };

        context.restore();

        context.save();
        context.beginPath();
        context.moveTo(topRight[0], topRight[1]);
        context.lineTo(bottomRight[0], bottomRight[1]);
        context.lineTo(bottomLeft[0], bottomLeft[1]);
        context.lineTo(topLeft[0], topLeft[1]);
        context.closePath();
        context.clip();
    });

    layerRight.on('postrender', function (event) {
        var context = event.context as CanvasRenderingContext2D;

        if (!context) {
            return <></>;
        };

        context.restore();
    });

    layerLeft.on('postrender', function (event) {
        var context = event.context as CanvasRenderingContext2D;

        if (!context) {
            return <></>;
        };

        context.restore();
    });

    const onChange = (newValue: number) => {
        setValue(newValue);
        map.render();
    };

    const top = 1 + 'vh';
    const padding = 10 + 'px';

    return (
        <>
            <Slider
                className='custom-slider'
                tooltip={{ open: false }}
                onChange={onChange}></Slider>
            <div id='label' style={{ position: 'relative', padding, left: labelPositionLeft, top }}>
                <Button type="primary">
                    Urban Heat Island (UHI)
                </Button>
            </div>
            <div id='label' style={{ position: 'relative', padding, right: labelPositionRight, top }}>
                <Button type="primary">
                   Heat Index (HI)
                </Button>
            </div>
        </>
    );
};

export default BasicSwipe;
