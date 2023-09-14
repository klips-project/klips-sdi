import * as React from 'react';
import { useEffect, useState } from 'react';

import { StyleLike as OlStyleLike } from 'ol/style/Style';
import OlInteractionDraw, { DrawEvent as OlDrawEvent, Options as OlDrawOptions } from 'ol/interaction/Draw';
import * as OlEventConditions from 'ol/events/condition';
import OlVectorSource from 'ol/source/Vector';
import OlGeometry from 'ol/geom/Geometry';
import OlVectorLayer from 'ol/layer/Vector';
import OlFormatWKT from 'ol/format/WKT';
import OlFormatGeoJSON from 'ol/format/GeoJSON';

import { useMap } from '@terrestris/react-geo/dist/Hook/useMap';
import { DigitizeUtil } from '@terrestris/react-geo/dist/Util/DigitizeUtil';

type DrawType = 'Point' | 'Polygon';
type Output = { coordinatesWKT?: string; coordinatesGeoJSON?: string; } | undefined;

interface OwnProps {
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
    onDrawEnd?: (event: OlDrawEvent) => void;
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
}

export type GetCoordinatesStringProps = OwnProps;

/**
 * The DrawButton.
 */
const GetCoordinatesString: React.FC<GetCoordinatesStringProps> = ({
    drawInteractionConfig,
    drawStyle,
    drawType,
    onDrawEnd,
    onDrawStart,
    passOutput,
    ...passThroughProps
}) => {

    const [drawInteraction, setDrawInteraction] = useState<OlInteractionDraw>();
    const [layer, setLayer] = useState<OlVectorLayer<OlVectorSource<OlGeometry>> | null>(null);
    // eslint-disable-next-line 
    const [outputGeom, setOutputGeom] = useState<Output | undefined>(undefined);



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

    }, [drawType, layer, drawInteractionConfig, drawStyle, map]);

    useEffect(() => {
        if (!drawInteraction) {
            return undefined;
        }
        /**
         * Called when the drawing interaction is finished. 
         * Coordinates of the Feature are given as string in WKT- and GeoJSON-format.
         */
        drawInteraction.on('drawend', (evt) => {
            onDrawEnd?.(evt);
            const geometry = evt.feature.getGeometry();
            const formatWKT = new OlFormatWKT();
            const formatGeoJSON = new OlFormatGeoJSON();

            if (geometry) {
                const coordinatesWKT = formatWKT.writeGeometry(geometry);
                const coordinatesGeoJSON = formatGeoJSON.writeGeometry(geometry);

                setOutputGeom({
                    coordinatesWKT: coordinatesWKT,
                    coordinatesGeoJSON: coordinatesGeoJSON
                });
                drawInteraction.setActive(false);
            };
        });
        /** 
         * Called when the drawing interaction is started. Previously drawn feature is removed.
         */
        drawInteraction.on('drawstart', (evt) => {
            onDrawStart?.(evt);
            const features = layer?.getSource()?.getFeatures();
            if (features) {
                const lastFeature = features[features.length - 1];
                layer?.getSource()?.removeFeature(lastFeature);
            };
        });

        // eslint-disable-next-line 
    }, [drawInteraction, onDrawStart, onDrawEnd, layer, map]);

    useEffect(() => {
        if (!outputGeom) {
            return;
        }
        passOutput?.(outputGeom.coordinatesWKT);
    }, [outputGeom, passOutput]);

    if (!drawInteraction || !layer) {
        return null;
    }

    /**
     * Called when the draw button is toggled. If the button state is pressed,
     * the draw interaction will be activated.
     */
    const handleFeatureSelect = (pressed: any) => {
        drawInteraction.setActive(pressed);
    };
    // Optional: Display output coordinatess
    const text = (
        <div className='text-wrapper'>
            <span>{outputGeom?.coordinatesGeoJSON?.includes(drawType) ? outputGeom.coordinatesGeoJSON : ''} </span>
        </div>
    );

    return (
        <div>
            <button
                onClick={handleFeatureSelect}
                {...passThroughProps}
            />
            {text}
        </div>);
};

export default GetCoordinatesString;
