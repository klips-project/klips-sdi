import * as React from 'react';
import { useEffect, useState } from 'react';

import { StyleLike as OlStyleLike } from 'ol/style/Style';
import OlInteractionDraw, { DrawEvent as OlDrawEvent, Options as OlDrawOptions } from 'ol/interaction/Draw';
import * as OlEventConditions from 'ol/events/condition';
import OlVectorSource from 'ol/source/Vector';
import OlGeometry from 'ol/geom/Geometry';
import OlVectorLayer from 'ol/layer/Vector';

import { useMap } from '@terrestris/react-geo/dist/Hook/useMap';
import { DigitizeUtil } from '@terrestris/react-geo/dist/Util/DigitizeUtil';
import { Alert, Button } from 'antd';
import { ButtonGroupProps } from 'antd/lib/button';

import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil.js';

type DrawType = 'Point' | 'Polygon';
interface DrawGeometryProps extends ButtonGroupProps {
    /**
     * Whether a point or polygon should
     * be drawn.
     */
    drawType: DrawType;
    /**
     * Style object / style function for drawn feature.
     */
    drawStyle?: OlStyleLike;
    /**
     * Listener function for the 'drawend' event of an ol.interaction.Draw.
     */
    onDrawEnd?: (geom: OlGeometry) => void;
    /**
     * Listener function for the 'drawstart' event of an ol.interaction.Draw.
     */
    onDrawStart?: (event: OlDrawEvent) => void;
    /**
    * Function to pass value to parent.
    */
    passOutput?: (newParam: any) => void;
    /**
     * Additional configuration object to apply to the ol.interaction.Draw.
     * See https://openlayers.org/en/latest/apidoc/module-ol_interaction_Draw-Draw.html
     * for more information
     *
     * Note: The keys source, type, geometryFunction, style and freehandCondition
     *       are handled internally and shouldn't be overwritten without any
     *       specific cause.
     */
    drawInteractionConfig?: Omit<OlDrawOptions, 'source' | 'type' | 'geometryFunction' | 'style' | 'freehandCondition'>;

    outputVisibility?: boolean;
}
/**
 * The Button.
 */
const DrawGeometry: React.FC<DrawGeometryProps> = ({
    drawInteractionConfig,
    drawStyle,
    drawType,
    onDrawEnd,
    onDrawStart,
    passOutput,
    outputVisibility,
    ...passThroughProps
}) => {

    const [drawInteraction, setDrawInteraction] = useState<OlInteractionDraw>();
    const [layer, setLayer] = useState<OlVectorLayer<OlVectorSource<OlGeometry>> | null>(null);
    const [isLegal, setIsLegal] = useState<Boolean>(true);

    /**
  * Currently drawn feature which should be represent as label or postit.
  */
    const map = useMap();

    useEffect(() => {
        if (!map) {
            return;
        } else {
            setLayer(DigitizeUtil.getDigitizeLayer(map));
        }
    }, [map]);

    useEffect(() => {

        if (drawInteraction) {
            return;
        }
        if (!map || !layer) {
            return undefined;
        }

        let geometryFunction;
        const type = drawType;

        const newInteraction = new OlInteractionDraw({
            source: layer.getSource() || undefined,
            type: type,
            stopClick: true,
            geometryFunction: geometryFunction,
            style: drawStyle ?? DigitizeUtil.defaultDigitizeStyleFunction,
            freehandCondition: OlEventConditions.never,
            ...(drawInteractionConfig ?? {})
        });

        newInteraction.set('name', `react-geo-draw-interaction-${drawType}`);

        newInteraction.setActive(false);

        map.addInteraction(newInteraction);

        setDrawInteraction(newInteraction);

    }, [drawType, layer, drawInteractionConfig, drawStyle, map, drawInteraction]);

    useEffect(() => {
        if (!drawInteraction) {
            return undefined;
        }

        drawInteraction.on('drawstart', (evt) => {
            onDrawStart?.(evt);
            const features = layer?.getSource()?.getFeatures();
            if (features) {
                const lastFeature = features[features.length - 1];
                layer?.getSource()?.removeFeature(lastFeature);
            };
            setIsLegal(true);
        });

        drawInteraction.on('drawend', (evt) => {
            if (!map) return;

            const tiffExtentVectorLayer = MapUtil.getLayerByName(map, 'BboxLayer') as OlVectorLayer<OlVectorSource>;
            let feature = evt.feature as any;
            let coords = [];
            if (drawType === 'Point') {
                coords.push((feature).getGeometry().getCoordinates())
            }
            if (drawType === 'Polygon') {
                coords = feature.getGeometry().getCoordinates()[0];
            }

            const geometry = evt.feature.getGeometry();
            if (geometry) {
                onDrawEnd?.(geometry);
                let isWithinBoundaries: boolean[] = [];

                drawInteraction.setActive(false);
                const features = tiffExtentVectorLayer.getSource()?.getFeatures();

                if (!features || features.length === 0) {
                    isWithinBoundaries.push(false);
                    return;
                }
                const geom = features[0].getGeometry();

                coords.forEach((coordinate: [number, number]) => {
                    if (!geom) return;
                    isWithinBoundaries.push(geom.intersectsCoordinate(coordinate));
                });

                setIsLegal(!isWithinBoundaries.includes(false))
            };

        });

    }, [drawInteraction, drawType, onDrawEnd, onDrawStart, layer, map]);

    if (!drawInteraction || !layer) {
        return null;
    }

    /**
     * Called when the draw button is toggled. If the button state is pressed,
     * the draw interaction will be activated.
     */
    const handleFeatureSelect = () => {
        drawInteraction.setActive(true);
    };

    const getButtonName = (drawType: string) => {
        if (drawType === 'Point') {
            return 'Punkt';
        } if (drawType === 'Polygon') {
            return 'Polygon';
        }
    }

    return (
        <>
            <Button
                type='primary'
                onClick={handleFeatureSelect}
                {...passThroughProps}
            >
                {getButtonName(drawType)}
            </Button>
            {!isLegal ?
                <Alert
                    className='geometry-alert'
                    message="Error"
                    description="Die Geometrie befindet sich außerhalb der gewählten Region."
                    type="error"
                    showIcon
                /> : <></>}
        </>);
};

export default DrawGeometry;
