import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import PropTypes from 'prop-types';
import CustomZoom from '../../Map/CustomZoom';
import CustomCompass from '../../Map/CustomCompass';
import GoogleMap from 'google-map-react';
import { DEFAULT_ZOOM, GMAPS_API_KEY, isPoint } from '../../../containers/Map/constants';
import MapPin from '../../../assets/images/map/map_pin.svg';
import {
  createMarkerClusters,
  DEFAULT_POLYGON_OPACITY,
  drawCropLocation,
  SELECTED_POLYGON_OPACITY,
} from './drawLocations';
import { usePropRef } from './usePropRef';
import { getOverlappedAreaAndLines } from './getOverlappedAreaAndLines';
import PureSelectionHandler from './PureMapLocationSelectionModal';
import styles from './styles.module.scss';
import { icons, selectedIcons } from '../../../containers/Map/mapStyles';

const LocationPicker = ({
  onSelectLocation,
  clearLocations = onSelectLocation,
  selectedLocationIds,
  isPinMode,
  setPinCoordinate,
  pinCoordinate,
  locations,
  farmCenterCoordinate,
  style,
  readOnlyPinCoordinates,
  maxZoomRef,
  getMaxZoom,
}) => {
  const [isGoogleMapInitiated, setGoogleMapInitiated] = useState(false);
  const geometriesRef = useRef({});
  const markerClusterRef = useRef();
  const mapRef = useRef();

  const onSelectLocationRef = usePropRef(onSelectLocation);
  const setPinCoordinateRef = usePropRef(setPinCoordinate);
  const clearLocationsRef = usePropRef(clearLocations);
  const selectedLocationIdsRef = usePropRef(selectedLocationIds);

  const pinMarkerRef = useRef();
  useEffect(() => {
    if (pinMarkerRef.current) {
      pinMarkerRef.current.isPinMode = isPinMode;
      pinMarkerRef.current.setOptions({ visible: !!isPinMode && !!pinCoordinate });
      pinCoordinate && pinMarkerRef.current.setOptions({ position: pinCoordinate });
      !isPinMode && setPinCoordinate?.(null);
    }
    for (const location_id in geometriesRef.current) {
      const { polygon } = geometriesRef.current[location_id];
      polygon?.setOptions({ clickable: !isPinMode });
    }
    overlappedPositions.length && dismissSelectionModal();
    if (mapRef.current) {
      mapRef.current.setOptions({
        draggableCursor: isPinMode ? 'crosshair' : '',
      });
    }
  }, [isPinMode, isGoogleMapInitiated]);

  useEffect(() => {
    if (markerClusterRef?.current?.markers?.length > 0) {
      // hack to get around weird shallow copy caused by the readonly typescript definition
      const markers = [...markerClusterRef.current.markers];
      // this forces the clusters to rerender, so that the colours update
      markerClusterRef?.current?.clearMarkers();
      markerClusterRef?.current?.addMarkers(markers);
    }
  }, [selectedLocationIds]);

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

  function areaOnClick(latLng, maps) {
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

  function mapOnClick(latLng, maps) {
    if (pinMarkerRef.current?.isPinMode) {
      pinMarkerRef.current?.setOptions({ position: latLng, visible: true });
      setPinCoordinateRef.current?.(latLng.toJSON());
      clearLocationsRef.current();
    }
  }

  const dismissSelectionModal = () => setOverlappedPositions([]);
  const onSelectionModalClick = (location_id) => {
    onSelectLocationRef.current(location_id);
    dismissSelectionModal();
  };

  const drawWildCropPins = (map, maps, mapBounds) => {
    for (const pinCoordinate of readOnlyPinCoordinates || []) {
      new maps.Marker({
        icon: MapPin,
        position: pinCoordinate,
        map: map,
      });
      mapBounds.extend(pinCoordinate);
    }
  };

  const drawLocations = (map, maps, mapBounds) => {
    locations.forEach((location) => {
      const assetGeometry = drawCropLocation(map, maps, mapBounds, location);
      geometriesRef.current[assetGeometry.location.location_id] = assetGeometry;
      if (selectedLocationIds.includes(assetGeometry.location.location_id)) {
        setSelectedGeometryStyle(assetGeometry);
      }
      if (isPoint(assetGeometry.location.type)) {
        maps.event.addListener(assetGeometry.marker, 'click', (e) =>
          onSelectLocationRef.current(assetGeometry.location.location_id),
        );
      } else {
        maps.event.addListener(assetGeometry.polygon, 'click', (e) => areaOnClick(e.latLng, maps));
      }
    });
    createMarkerClusters(
      maps,
      map,
      Object.values(geometriesRef.current).filter(({ location: { type } }) => isPoint(type)),
      selectedLocationIdsRef,
      markerClusterRef,
    );
    maps.event.addListener(markerClusterRef.current, 'click', (cluster) => {
      if (map.getZoom() >= (maxZoomRef?.current || 20) && cluster.markers.length > 1) {
        setOverlappedPositions(
          cluster.markers.map((marker) => ({
            location_id: marker.location_id,
            name: marker.name,
            type: marker.type,
          })),
        );
      }
    });
  };

  const setSelectedGeometryStyle = (assetGeometry) => {
    if (isPoint(assetGeometry.location.type)) {
      assetGeometry?.marker?.setOptions({ icon: selectedIcons[assetGeometry.location.type] });
    } else {
      assetGeometry?.marker?.setOptions({
        label: { ...(assetGeometry?.marker?.label || {}), color: 'black' },
      });
      assetGeometry.polygon.setOptions({
        fillColor: assetGeometry.styles.selectedColour || 'white',
        fillOpacity: SELECTED_POLYGON_OPACITY,
      });
    }
  };

  const resetGeometryStyle = (assetGeometry) => {
    if (isPoint(assetGeometry.location.type)) {
      assetGeometry?.marker?.setOptions({ icon: icons[assetGeometry.location.type] });
    } else {
      assetGeometry?.marker?.setOptions({
        label: { ...(assetGeometry?.marker?.label || {}), color: 'white' },
      });
      assetGeometry?.polygon?.setOptions({
        fillColor: assetGeometry.styles.colour,
        fillOpacity: DEFAULT_POLYGON_OPACITY,
      });
    }
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
    mapRef.current = map;
    getMaxZoom?.(maps);
    const mapBounds = new maps.LatLngBounds();
    mapBounds.extend(farmCenterCoordinate);
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
    const rootZoomControlDiv = createRoot(zoomControlDiv);
    rootZoomControlDiv.render(
      <CustomZoom
        style={{ margin: '12px' }}
        onClickZoomIn={() => map.setZoom(map.getZoom() + 1)}
        onClickZoomOut={() => map.setZoom(map.getZoom() - 1)}
      />,
    );
    map.controls[maps.ControlPosition.RIGHT_BOTTOM].push(zoomControlDiv);

    const compassControlDiv = document.createElement('div');
    const rootCompassControlDiv = createRoot(compassControlDiv);
    rootCompassControlDiv.render(<CustomCompass style={{ marginRight: '12px' }} />);
    map.controls[maps.ControlPosition.RIGHT_BOTTOM].push(compassControlDiv);

    // Drawing locations on map
    drawWildCropPins(map, maps, mapBounds);
    drawLocations(map, maps, mapBounds);
    map.fitBounds(mapBounds);

    setGoogleMapInitiated(true);
  };

  return (
    <div data-cy="map-selectLocation" className={styles.mapContainer} style={style}>
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
      {overlappedPositions.length > 1 && !isPinMode && (
        <PureSelectionHandler
          locations={overlappedPositions}
          onSelect={onSelectionModalClick}
          dismissSelectionModal={dismissSelectionModal}
          selectedLocationIds={selectedLocationIds}
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
  readOnlyPinCoordinates: PropTypes.arrayOf(
    PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  ),
  maxZoomRef: PropTypes.object,
  getMaxZoom: PropTypes.func,
};

export default LocationPicker;
