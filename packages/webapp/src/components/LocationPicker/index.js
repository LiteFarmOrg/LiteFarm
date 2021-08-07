import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import CustomZoom from '../Map/CustomZoom';
import CustomCompass from '../Map/CustomCompass';
import GoogleMap from 'google-map-react';
import { DEFAULT_ZOOM, GMAPS_API_KEY } from '../../containers/Map/constants';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../containers/userFarmSlice';
import MapPin from '../../assets/images/map/map_pin.svg';
import {
  DEFAULT_POLYGON_OPACITY,
  drawCropLocation,
  SELECTED_POLYGON_OPACITY,
} from './drawLocations';

const LocationPicker = ({
  className,
  setLocationId,
  selectedLocationId,
  canUsePin,
  setPinLocation,
  currentPin,
  cropLocations,
}) => {
  const pinMarkerRef = useRef();
  const geometriesRef = useRef({});
  const selectedGeometryRef = useRef();
  const { grid_points } = useSelector(userFarmSelector);

  const setLocationIdRef = useRef();
  useEffect(() => {
    setLocationIdRef.current = setLocationId;
  }, [setLocationId]);

  const setPinLocationRef = useRef();
  useEffect(() => {
    setPinLocationRef.current = setPinLocation;
  }, [setPinLocation]);

  useEffect(() => {
    if (pinMarkerRef.current) {
      pinMarkerRef.current.canUsePin = canUsePin;
      pinMarkerRef.current.setOptions({ visible: canUsePin && !!currentPin });
      currentPin && pinMarkerRef.current.setOptions({ position: currentPin });
      !canUsePin && setPinLocation(null);
    }
    for (const location_id in geometriesRef.current) {
      const { polygon } = geometriesRef.current[location_id];
      polygon.setOptions({ clickable: !canUsePin });
    }
  }, [canUsePin]);

  useEffect(() => {
    if (
      geometriesRef.current[selectedLocationId] &&
      selectedGeometryRef.current?.location.location_id !== selectedLocationId
    ) {
      onSelectGeometry(geometriesRef.current[selectedLocationId]);
    } else if (!selectedLocationId) {
      deselectLocationAndResetGeometryStyle();
    }
  }, [selectedLocationId]);

  function mapOnClick(latLng) {
    if (pinMarkerRef.current?.canUsePin) {
      pinMarkerRef.current?.setOptions({ position: latLng, visible: true });
      setPinLocationRef.current(latLng);
      deselectLocationAndResetGeometryStyle();
    }
  }

  const drawLocations = (map, maps, mapBounds) => {
    cropLocations.forEach((location) => {
      const assetGeometry = drawCropLocation(map, maps, mapBounds, location);
      assetGeometry.polygon.setOptions({ clickable: !canUsePin });
      geometriesRef.current[assetGeometry.location.location_id] = assetGeometry;
      if (assetGeometry.location.location_id === selectedLocationId) {
        setSelectedGeometryStyle(assetGeometry);
      }
      maps.event.addListener(assetGeometry.polygon, 'mouseover', function () {
        if (this.fillOpacity !== 1.0) {
          this.setOptions({ fillOpacity: 0.8 });
        }
      });
      maps.event.addListener(assetGeometry.polygon, 'mouseout', function () {
        if (this.fillOpacity !== 1.0) {
          this.setOptions({ fillOpacity: 0.5 });
        }
      });
      maps.event.addListener(assetGeometry.polygon, 'click', () => onSelectGeometry(assetGeometry));
    });
    cropLocations.length > 0 && map.fitBounds(mapBounds);
  };

  const onSelectGeometry = (assetGeometry) => {
    if (assetGeometry.location.location_id !== selectedGeometryRef.current?.location.location_id) {
      deselectLocationAndResetGeometryStyle();
      setSelectedGeometryStyle(assetGeometry);
      setLocationIdRef.current?.(assetGeometry.location.location_id);
    } else {
      deselectLocationAndResetGeometryStyle();
    }
  };

  const setSelectedGeometryStyle = (assetGeometry) => {
    selectedGeometryRef.current = assetGeometry;
    assetGeometry?.marker?.setOptions({
      label: { ...(assetGeometry?.marker?.label || {}), color: 'black' },
    });
    assetGeometry.polygon.setOptions({
      fillColor: assetGeometry.styles.selectedColour,
      fillOpacity: SELECTED_POLYGON_OPACITY,
    });
  };

  const deselectLocationAndResetGeometryStyle = () => {
    const assetGeometry = selectedGeometryRef.current;
    assetGeometry?.marker?.setOptions({
      label: { ...(assetGeometry?.marker?.label || {}), color: 'white' },
    });
    assetGeometry?.polygon?.setOptions({
      fillColor: assetGeometry.styles.colour,
      fillOpacity: DEFAULT_POLYGON_OPACITY,
    });
    selectedGeometryRef.current = undefined;
    setLocationIdRef.current?.(null);
  };

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
      mapTypeId: maps.MapTypeId.SATELLITE,
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
    const mapBounds = new maps.LatLngBounds();
    pinMarkerRef.current = new maps.Marker({
      icon: MapPin,
      position: currentPin || map.getCenter().toJSON(),
      map: map,
      visible: !!currentPin,
      canUsePin,
    });
    currentPin && mapBounds.extend(currentPin);
    map.addListener('click', (e) => {
      mapOnClick(e.latLng.toJSON());
    });

    //TODO: move to mapUtil.polygonGetAveragePoint
    maps.Polygon.prototype.getAveragePoint = function () {
      const latLngArray = this.getPath().getArray();
      const { latSum, lngSum } = latLngArray.reduce(
        (latLngSum, latLng) => {
          latLngSum.latSum += latLng.lat();
          latLngSum.lngSum += latLng.lng();
          return latLngSum;
        },
        { latSum: 0, lngSum: 0 },
      );
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
    drawLocations(map, maps, mapBounds);
  };

  return (
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
  );
};

LocationPicker.prototype = {
  className: PropTypes.string,
  setSelectedLocation: PropTypes.object,
  selectedLocationId: PropTypes.string,
};

export default LocationPicker;
