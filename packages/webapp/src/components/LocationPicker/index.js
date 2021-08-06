import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import CustomZoom from '../Map/CustomZoom';
import CustomCompass from '../Map/CustomCompass';
import GoogleMap from 'google-map-react';
import { DEFAULT_ZOOM, GMAPS_API_KEY } from '../../containers/Map/constants';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../containers/userFarmSlice';
import useDrawSelectableLocations from './useDrawSelectableLocations';
import useMapSelectionRenderer from '../../containers/Map/useMapSelectionRenderer';
import MapPin from '../../assets/images/map/map_pin.svg';
import LocationSelectionModal from '../../containers/Map/LocationSelectionModal';

const LocationPicker = ({
  className,
  setLocationId,
  selectedLocationId,
  canUsePin,
  setPinLocation,
  currentPin,
  canSelectMultipleLocations,
  setLocationIds,
  selectedLocationIds,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(currentPin);
  const [selectedPin, setSelectedPin] = useState(null);
  const [innerMap, setInnerMap] = useState(null);
  const { grid_points } = useSelector(userFarmSelector);
  //const { drawLocations } = useDrawSelectableLocations(setLocationId);
  const { drawAssets } = useMapSelectionRenderer({ 
    isClickable: true, 
    isSelectable: true,
    onlyCrop: true, 
    setLocationId: setLocationId,
    multipleLocations: canSelectMultipleLocations,
    setMultipleLocationIds: setLocationIds,
  });

  function placeMarker(latLng, map, maps) {
    setSelectedPin(
      new maps.Marker({
        icon: MapPin,
        position: latLng,
        map: map,
      }),
    );
  }

  const drawPinIfOnPinMode = (latLng, map, maps) => {
    if (canUsePin) {
      selectedPin?.setMap(null);
      placeMarker(latLng, map, maps);
    }
  };

  useEffect(() => {

    if (innerMap && canUsePin) {
      drawPinIfOnPinMode(selectedLocation, innerMap.map, innerMap.maps);
    }
    if (!canUsePin) {
      selectedPin?.setMap(null);
      setSelectedPin(null);
      setSelectedLocation(null);
    }
  }, [innerMap, selectedLocation, canUsePin]);

  useEffect(() => {
    setPinLocation(selectedLocation);
  }, [selectedLocation]);


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

    setInnerMap({ map, maps });
    map.addListener('click', (e) => {
      setSelectedLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    });

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
    //drawLocations(map, maps, mapBounds, selectedLocationId);
    drawAssets(map, maps, mapBounds, selectedLocationId, selectedLocationIds);
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
      <LocationSelectionModal
        selectingOnly={true}
      />
    </>
  );
};

LocationPicker.prototype = {
  className: PropTypes.string,
  setSelectedLocation: PropTypes.object,
  selectedLocationId: PropTypes.string,
  canSelectMultipleLocations: PropTypes.bool,
};

export default LocationPicker;
