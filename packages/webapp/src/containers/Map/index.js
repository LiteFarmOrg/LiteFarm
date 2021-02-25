import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import GoogleMap from 'google-map-react';
import { DEFAULT_ZOOM, GMAPS_API_KEY } from './constants';
import PureMapHeader from '../../components/Map/Header';
import PureMapFooter from '../../components/Map/Footer';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../containers/userFarmSlice';

export default function Map() {
  const { farm_name, grid_points, is_admin } = useSelector(userFarmSelector);
  const { t } = useTranslation();

  const getMapOptions = (maps) => {
    return {
      streetViewControl: false,
      scaleControl: true,
      fullscreenControl: false,
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
      disableDoubleClickZoom: true,
      minZoom: 1,
      maxZoom: 80,
      tilt: 0,
      mapTypeControl: true,
      mapTypeId: maps.MapTypeId.SATELLITE,
      mapTypeControlOptions: {
        style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: maps.ControlPosition.BOTTOM_CENTER,
        mapTypeIds: [maps.MapTypeId.ROADMAP, maps.MapTypeId.SATELLITE, maps.MapTypeId.HYBRID],
      },
      zoomControl: true,
      clickableIcons: false,
    };
  };

  useEffect(() => {
    // setCenter(grid_points);
  }, []);

  const handleGoogleMapApi = (map, maps) => {
    console.log(map);
    console.log(maps);
  }

  return (
    <div className={styles.pageWrapper}>
      <PureMapHeader
        className={styles.mapHeader}
        farmName={farm_name}
      />
      <div className={styles.mapContainer}>
        <div className={styles.workaround}>
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
        >
        </GoogleMap>
        </div>
      </div>
      <PureMapFooter
        className={styles.mapFooter}
        isAdmin={is_admin}
        showSpotlight={true}
      />
    </div>
  )
}
