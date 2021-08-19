import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import clsx from 'clsx';
import GoogleMap from 'google-map-react';
import { DEFAULT_ZOOM, GMAPS_API_KEY } from '../../containers/Map/constants';
import CustomZoom from '../Map/CustomZoom';
import CustomCompass from '../Map/CustomCompass';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../containers/userFarmSlice';
import useMapLocationsRenderer from './useMapLocationsRenderer';

const areaTypes = [
  'field',
  'garden',
  'barn',
  'greenhouse',
  'ceremonial_area',
  'surface_water',
  'natural_area',
  'residence',
];
const lineTypes = ['buffer_zone', 'watercourse', 'fence', 'farm_site_boundary'];
const pointTypes = ['gate', 'water_valve'];

const LocationViewer = ({ className, viewLocations }) => {
  const { grid_points } = useSelector(userFarmSelector);
  const { drawAssets } = useMapLocationsRenderer({
    locations: viewLocations,
  });

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
      disableDoubleClickZoom: false,
      minZoom: 1,
      maxZoom: 80,
      tilt: 0,
      mapTypeId: maps.MapTypeId.SATELLITE,
      mapTypeControlOptions: {
        style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: maps.ControlPosition.BOTTOM_CENTER,
        mapTypeIds: [maps.MapTypeId.ROADMAP, maps.MapTypeId.SATELLITE],
      },
      gestureHandling: 'greedy',
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
      let res = new maps.LatLng(latSum / latLngArray.length, lngSum / latLngArray.length);
      return res;
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
  };

  return (
    <>
      <div className={clsx(className)}>
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
    </>
  );
};

LocationViewer.prototype = {
  className: PropTypes.string,
  setSelectedLocation: PropTypes.object,
  selectedLocationId: PropTypes.string,
  canSelectMultipleLocations: PropTypes.bool,
};

export default LocationViewer;
