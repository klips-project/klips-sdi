import React from 'react';

//import Swipe from "ol-ext/control/Swipe";

import useMap from '@terrestris/react-geo/dist/Hook/useMap';

import './index.less';
import { Divider, Slider } from 'antd';
import { getRenderPixel } from 'ol/render';
import RenderEvent from 'ol/render/Event';

export interface SwipeProps {
};

export type BasicSwipeProps = SwipeProps;

export const BasicSwipe: React.FC<BasicSwipeProps> = () => {

    const map = useMap();

    if (!map) {
        return <></>;
    };

    const layer = map.getAllLayers()[2];

    const onChange = (value: number) => {
        layer.on('prerender', function (event: RenderEvent) {
            const mapSize = map.getSize(); // [width, height] in CSS pixels

            if (!mapSize) {
                return <></>;
            };

            // get render coordinates and dimensions given CSS coordinates
            const width = Math.round(mapSize[0] * (value / 100));

            const bottomLeft = getRenderPixel(event, [width, mapSize[1]]);
            const topLeft = getRenderPixel(event, [width, 0]);
            const topRight = getRenderPixel(event, [mapSize[0], 0]);
            const bottomRight = getRenderPixel(event, mapSize);

            const context = event.context as CanvasRenderingContext2D;

            if (!context) {
                return <></>;
            };

            while (value > 0) {
                context.restore();
                value--;
            }
            value++;

            context.save();
            context.beginPath();
            context.moveTo(topLeft[0], topLeft[1]);
            context.lineTo(bottomLeft[0], bottomLeft[1]);
            context.lineTo(bottomRight[0], bottomRight[1]);
            context.lineTo(topRight[0], topRight[1]);
            context.closePath();
            context.clip();

            // //Add Line
            // var points = [topRight, bottomLeft];

            // const featureLine = new Feature({
            //     geometry: new LineString(points)
            // });

            // const vectorLine = new VectorSource({});
            // vectorLine.addFeature(featureLine);

            // const vectorLineLayer = new Vector({
            //     source: vectorLine,
            //     // style: new Style({
            //     //     fill: new Fill({ color: '#00FF00' }),
            //     //     stroke: new Stroke({ color: '#00FF00', width: 2 })
            //     // })
            // });
            // map.addLayer(vectorLineLayer);
        });

        layer.on("postrender", function (event) {
            var context = event.context as CanvasRenderingContext2D;

            if (!context) {
                return <></>;
            };

            setTimeout(function () {
                while (value > 0) {
                    context.restore();
                    value--;
                }
            }, 0);
        });
        map.render();
    };

    return (
        <Slider
            tooltip={{ open: false }}
            onChange={onChange}></Slider>
    );
};

export default BasicSwipe;
