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
    // let farmBounds = new maps.LatLngBounds();
    // let len = 0;
    // let fieldIcon = {
    //   path: TREE_ICON,
    //   fillColor: styles.primaryColor,
    //   fillOpacity: 0,
    //   strokeWeight: 0,
    //   scale: 0.5,
    // };

    // maps.Polygon.prototype.getPolygonBounds = function () {
    //   var bounds = new maps.LatLngBounds();
    //   this.getPath().forEach(function (element, index) {
    //     bounds.extend(element);
    //   });
    //   return bounds;
    // };

    // let addListenersOnPolygonAndMarker = function (polygon, fieldObject) {
    //   // creates field marker
    //   var fieldMarker = new maps.Marker({
    //     position: polygon.getPolygonBounds().getCenter(),
    //     map: map,
    //     icon: fieldIcon,
    //     label: { text: fieldObject.field_name, color: 'white' },
    //   });

    //   // attach on click listeners
    //   //activeInfoWindow = null;

    //   function pushToHist() {
    //     history.push('./edit_field?' + fieldObject.field_id);
    //   }

    //   fieldMarker.setMap(map);

    //   maps.event.addListener(fieldMarker, 'click', function (event) {
    //     pushToHist();
    //   });
    //   maps.event.addListener(polygon, 'click', function (event) {
    //     pushToHist();
    //   });
    // };

    // if (this.state.fields && this.state.fields.length >= 1) {
    //   len = this.state.fields.length;
    //   let i;

    //   for (i = 0; i < len; i++) {
    //     // ensure that the map shows this field
    //     this.state.fields[i].grid_points.forEach((grid_point) => {
    //       farmBounds.extend(grid_point);
    //     });
    //     // creates the polygon to be displayed on the map
    //     var polygon = new maps.Polygon({
    //       paths: this.state.fields[i].grid_points,
    //       strokeColor: styles.primaryColor,
    //       strokeOpacity: 0.8,
    //       strokeWeight: 3,
    //       fillColor: styles.primaryColor,
    //       fillOpacity: 0.35,
    //     });
    //     polygon.setMap(map);
    //     addListenersOnPolygonAndMarker(polygon, this.state.fields[i]);
    //   }
    //   map.fitBounds(farmBounds);
    // }
    // this.setState({
    //   map,
    //   maps,
    //   isMapLoaded: true,
    // });
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
          {/* <CenterDiv
            lat={this.state.center.lat}
            lng={this.state.center.lng}
            text={'' && this.props.farm.farm_name}
          /> */}
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
