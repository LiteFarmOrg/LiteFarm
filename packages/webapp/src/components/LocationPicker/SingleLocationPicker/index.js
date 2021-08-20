import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import CustomZoom from '../../Map/CustomZoom';
import CustomCompass from '../../Map/CustomCompass';
import GoogleMap from 'google-map-react';
import { DEFAULT_ZOOM, GMAPS_API_KEY } from '../../../containers/Map/constants';
import MapPin from '../../../assets/images/map/map_pin.svg';
import {
  DEFAULT_POLYGON_OPACITY,
  drawCropLocation,
  SELECTED_POLYGON_OPACITY,
} from './drawLocations';
import { usePropRef } from './usePropRef';
import { getOverlappedAreaAndLines } from './getOverlappedAreaAndLines';
import PureSelectionHandler from './PureMapLocationSelectionModal';

const LocationPicker = ({
  className,
  onSelectLocation,
  clearLocations = onSelectLocation,
  selectedLocationIds,
  isPinMode,
  setPinCoordinate,
  pinCoordinate,
  cropLocations,
  farmCenterCoordinate,
}) => {
  const [isGoogleMapInitiated, setGoogleMapInitiated] = useState(false);
  const geometriesRef = useRef({});

  const onSelectLocationRef = usePropRef(onSelectLocation);
  const setPinCoordinateRef = usePropRef(setPinCoordinate);
  const clearLocationsRef = usePropRef(clearLocations);

  const pinMarkerRef = useRef();
  useEffect(() => {
    if (pinMarkerRef.current) {
      pinMarkerRef.current.isPinMode = isPinMode;
      pinMarkerRef.current.setOptions({ visible: isPinMode && !!pinCoordinate });
      pinCoordinate && pinMarkerRef.current.setOptions({ position: pinCoordinate });
      !isPinMode && setPinCoordinate(null);
    }
  }, [isPinMode, isGoogleMapInitiated]);

  const prevSelectedLocationIdsRef = useRef([]);
  useEffect(() => {
    for (const location_id of selectedLocationIds) {
      if (
        geometriesRef.current[location_id] &&
        !prevSelectedLocationIdsRef.current?.includes(location_id)
      ) {
        setSelectedGeometryStyle(geometriesRef.current[location_id]);
      }
    }
    for (const location_id of prevSelectedLocationIdsRef.current) {
      if (geometriesRef.current[location_id] && !selectedLocationIds?.includes(location_id)) {
        resetGeometryStyle(geometriesRef.current[location_id]);
      }
    }
    prevSelectedLocationIdsRef.current = selectedLocationIds;
  }, [selectedLocationIds, isGoogleMapInitiated]);

  const [overlappedPositions, setOverlappedPositions] = useState([]);

  function mapOnClick(latLng, maps) {
    if (pinMarkerRef.current?.isPinMode) {
      pinMarkerRef.current?.setOptions({ position: latLng, visible: true });
      setPinCoordinateRef.current(latLng.toJSON());
      clearLocationsRef.current();
    } else {
      const overlappedLocations = getOverlappedAreaAndLines(
        latLng,
        Object.values(geometriesRef.current),
        maps,
      );
      if (overlappedLocations.length > 1) {
        setOverlappedPositions(overlappedLocations);
      } else if (overlappedLocations.length === 1) {
        onSelectLocationRef.current(overlappedLocations[0].location_id);
      }
    }
  }

  const dismissSelectionModal = () => setOverlappedPositions([]);
  const onSelectionModalClick = (location_id) => {
    onSelectLocationRef.current(location_id);
    dismissSelectionModal();
  };

  const drawLocations = (map, maps, mapBounds) => {
    cropLocations.forEach((location) => {
      const assetGeometry = drawCropLocation(map, maps, mapBounds, location);
      assetGeometry.polygon.setOptions({ clickable: false });
      geometriesRef.current[assetGeometry.location.location_id] = assetGeometry;
      if (selectedLocationIds.includes(assetGeometry.location.location_id)) {
        setSelectedGeometryStyle(assetGeometry);
      }
    });
    cropLocations.length > 0 && map.fitBounds(mapBounds);
  };

  const setSelectedGeometryStyle = (assetGeometry) => {
    assetGeometry?.marker?.setOptions({
      label: { ...(assetGeometry?.marker?.label || {}), color: 'black' },
    });
    assetGeometry.polygon.setOptions({
      fillColor: assetGeometry.styles.selectedColour,
      fillOpacity: SELECTED_POLYGON_OPACITY,
    });
  };

  const resetGeometryStyle = (assetGeometry) => {
    assetGeometry?.marker?.setOptions({
      label: { ...(assetGeometry?.marker?.label || {}), color: 'white' },
    });
    assetGeometry?.polygon?.setOptions({
      fillColor: assetGeometry.styles.colour,
      fillOpacity: DEFAULT_POLYGON_OPACITY,
    });
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
      position: pinCoordinate || farmCenterCoordinate,
      map: map,
      visible: !!pinCoordinate,
      isPinMode,
    });
    pinCoordinate && mapBounds.extend(pinCoordinate);
    map.addListener('click', (e) => {
      mapOnClick(e.latLng, maps);
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

    setGoogleMapInitiated(true);
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
        defaultCenter={farmCenterCoordinate}
        defaultZoom={DEFAULT_ZOOM}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => handleGoogleMapApi(map, maps)}
        options={getMapOptions}
      />
      {overlappedPositions.length > 1 && (
        <PureSelectionHandler
          locations={overlappedPositions}
          onSelect={onSelectionModalClick}
          dismissSelectionModal={dismissSelectionModal}
        />
      )}
    </div>
  );
};

LocationPicker.prototype = {
  className: PropTypes.string,
  setSelectedLocation: PropTypes.object,
  selectedLocationIds: PropTypes.arrayOf(PropTypes.string),
  farmCenterCoordinate: PropTypes.object,
};

export default LocationPicker;
