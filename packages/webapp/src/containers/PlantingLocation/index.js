import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import GoogleMap from 'google-map-react';
import { DEFAULT_ZOOM, GMAPS_API_KEY, isArea, isLine, locationEnum } from '../Map/constants';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../userFarmSlice';
import useMapAssetRenderer from '../Map/useMapAssetRenderer';
import useDrawingManager from '../Map/useDrawingManager';
import {
    mapFilterSettingSelector,
} from '../Map/mapFilterSettingSlice';
import CustomZoom from '../../components/Map/CustomZoom';
import CustomCompass from '../../components/Map/CustomCompass';
import styles from './styles.module.scss';
import PageTitle from '../../components/PageTitle/v2';
import Button from '../../components/Form/Button';
import Form from '../../components/Form';
import ProgressBar from '../../components/ProgressBar';

export default function PlantingLocation({ history }) {

    const mapWrapperRef = useRef();
    const { grid_points } = useSelector(userFarmSelector);
    const [
        drawingState,
        {
            reconstructOverlay,
        },
    ] = useDrawingManager();

    const filterSettings = useSelector(mapFilterSettingSelector);
    const roadview = !filterSettings.map_background;

    const { drawAssets } = useMapAssetRenderer({ isClickable: false });

    const getMapOptions = (maps) => {
        return {
            styles: [
                {
                    featureType: 'poi.business',
                    elementType: 'labels',
                    stylers: [
                        {
                            visibility: 'off',
                        },
                    ],
                },
            ],
            gestureHandling: 'greedy',
            disableDoubleClickZoom: false,
            minZoom: 1,
            maxZoom: 80,
            tilt: 0,
            mapTypeId: !roadview ? maps.MapTypeId.SATELLITE : maps.MapTypeId.ROADMAP,
            mapTypeControlOptions: {
                style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: maps.ControlPosition.BOTTOM_CENTER,
                mapTypeIds: [maps.MapTypeId.ROADMAP, maps.MapTypeId.SATELLITE],
            },
            clickableIcons: false,
            streetViewControl: false,
            scaleControl: false,
            mapTypeControl: false,
            panControl: false,
            zoomControl: false,
            rotateControl: false,
            fullscreenControl: false,
        };
    };

    const handleGoogleMapApi = (map, maps) => {
        maps.Polygon.prototype.getPolygonBounds = function () {
            var bounds = new maps.LatLngBounds();
            this.getPath().forEach(function (element, index) {
                bounds.extend(element);
            });
            return bounds;
        };
        maps.Polygon.prototype.getAveragePoint = function () {
            const latLngArray = this.getPath().getArray();
            let latSum = 0;
            let lngSum = 0;
            for (const latLng of latLngArray) {
                latSum += latLng.lat();
                lngSum += latLng.lng();
            }
            return new maps.LatLng(latSum / latLngArray.length, lngSum / latLngArray.length);
        };
        const zoomControlDiv = document.createElement('div');
        ReactDOM.render(
            <CustomZoom
                style={{ margin: '12px' }}
                onClickZoomIn={() => map.setZoom(map.getZoom() + 1)}
                onClickZoomOut={() => map.setZoom(map.getZoom() - 1)}
            />,
            zoomControlDiv,
        );
        map.controls[maps.ControlPosition.RIGHT_BOTTOM].push(zoomControlDiv);

        const compassControlDiv = document.createElement('div');
        ReactDOM.render(<CustomCompass style={{ marginRight: '12px' }} />, compassControlDiv);
        map.controls[maps.ControlPosition.RIGHT_BOTTOM].push(compassControlDiv);

        // Drawing locations on map
        let mapBounds = new maps.LatLngBounds();
        drawAssets(map, maps, mapBounds);

        if (history.location.isStepBack) {
            reconstructOverlay();
        }

        if (history.location.cameraInfo) {
            const { zoom, location } = history.location.cameraInfo;
            if (zoom && location) {
                map.setZoom(zoom);
                map.setCenter(location);
            }
        }
    };

    return (
        <>
            <Form buttonGroup={
                <Button disabled={false} fullLength>
                    {'Continue'}
                </Button>
            }>
                <PageTitle title={'Add management plan'} onGoBack={() => { }} onCancel={() => { }} />
                <div
                    style={{
                        marginBottom: '24px',
                        marginTop: '8px',
                    }}
                >
                    <ProgressBar value={37.5} />
                </div>
                <div className={styles.planting_label}>{'Select a planting location'}</div>
                <div ref={mapWrapperRef} className={styles.mapContainer}>
                    <GoogleMap
                        style={{ flexGrow: 1 }}
                        bootstrapURLKeys={{
                            key: GMAPS_API_KEY,
                            libraries: ['drawing', 'geometry', 'places'],
                            language: localStorage.getItem('litefarm_lang'),
                        }}
                        defaultCenter={grid_points}
                        defaultZoom={DEFAULT_ZOOM}
                        yesIWantToUseGoogleMapApiInternals
                        onGoogleApiLoaded={({ map, maps }) => handleGoogleMapApi(map, maps)}
                        options={getMapOptions}
                    />
                </div>
                <div>
                    <div className={styles.shown_label}> {'Only locations that can contain crops are shown'}</div>
                </div>
            </Form>
        </>
    );
}
