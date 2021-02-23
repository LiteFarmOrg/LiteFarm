import Layout from '../Layout';
import Button from '../Form/Button';
import { ReactComponent } from '../../assets/images/expiredToken/expiredToken.svg';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { Semibold, Underlined } from '../Typography';
import GoogleMap from 'google-map-react';
import { DEFAULT_CENTER, DEFAULT_ZOOM, FARM_BOUNDS, GMAPS_API_KEY, TREE_ICON } from './constants';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../containers/userFarmSlice';
import PureMapHeader from './Header';
import PureMapFooter from './Footer';

export default function PureMap({ onClick, text, linkText, forgotPassword, isAdmin, farmName }) {
  const { t } = useTranslation();
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const { grid_points } = useSelector(userFarmSelector);

  useEffect(() => {
    setCenter(grid_points);
  }, []);

  const handleGoogleMapApi = (map, maps) => {
    console.log(map);
    console.log(maps);
  }

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

  return (
    <div className={styles.pageWrapper}>
      <PureMapHeader
        className={styles.mapHeader}
        farmName={farmName}
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
          defaultCenter={center}
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
        isAdmin={isAdmin}
      />
    </div>
  );
}

PureMap.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  linkText: PropTypes.string,
  forgotPassword: PropTypes.func,
  isAdmin: PropTypes.bool,
  farmName: PropTypes.string,
};
