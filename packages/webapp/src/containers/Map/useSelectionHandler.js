import { isArea, isLine, isPoint } from './constants';
import { useState, useEffect } from 'react';
import {
  canShowSelection,
  locations,
  canShowSelectionSelector,
  resetOverlappedLocationsSelector,
  resetOverlappedLocations,
} from '../mapSlice';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../history';
import MarkerClusterer from '@googlemaps/markerclustererplus';

const useSelectionHandler = () => {
  const initOverlappedLocations = {
    area: [],
    line: [],
    point: [],
  };

  const dispatch = useDispatch();

  const [overlappedLocations, setOverlappedLocations] = useState(initOverlappedLocations);
  //const [resetOverlappedLocations, setResetOverlappedLocations] = useState(false);

  const reset = useSelector(resetOverlappedLocationsSelector);
  // console.log(reset);

  useEffect(() => {
    // if (resetOverlappedLocations) {
    //   console.log("resetOverlappedLocations")
    //   setOverlappedLocations({ ...initOverlappedLocations });
    //   setResetOverlappedLocations(false)
    //   console.log(overlappedLocations)
    // }
    if (
      overlappedLocations.area.length > 0 ||
      overlappedLocations.line.length > 0 ||
      overlappedLocations.point.length > 0
    ) {
      console.log('overlapped locations length');
      console.log(overlappedLocations.point.length);
      if (
        overlappedLocations.area.length === 1 &&
        overlappedLocations.line.length === 0 &&
        overlappedLocations.point.length === 0
      ) {
        history.push(`/${overlappedLocations.area[0].type}/${overlappedLocations.area[0].id}/edit`);
      } else if (
        overlappedLocations.area.length === 0 &&
        overlappedLocations.line.length === 1 &&
        overlappedLocations.point.length === 0
      ) {
        history.push(`/${overlappedLocations.line[0].type}/${overlappedLocations.line[0].id}/edit`);
      } else {
        if (overlappedLocations.point.length === 1) {
          console.log('just one point');
          history.push(
            `/${overlappedLocations.point[0].type}/${overlappedLocations.point[0].id}/edit`,
          );
        } else {
          const locationArray = [];
          overlappedLocations.point.forEach((point) => {
            if (locationArray.length < 4) locationArray.push(point);
          });
          overlappedLocations.line.forEach((line) => {
            if (locationArray.length < 4) locationArray.push(line);
          });
          overlappedLocations.area.forEach((area) => {
            if (locationArray.length < 4) locationArray.push(area);
          });
          dispatch(canShowSelection(true));
          dispatch(locations(locationArray));
        }
      }
    }
  }, [overlappedLocations]);

  const handleSelection = (latLng, locationAssets, maps, isLocationAsset, isLocationCluster) => {
    console.log('handle selection');
    console.log(locationAssets);
    // console.log(locationAssets)
    // const markerCluster = new MarkerClusterer(maps, locationAssets.water_valve,
    //   {
    //     imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    //   });
    let overlappedLocationsCopy = null;
    // console.log('handle selection');
    // console.log(resetOverlappedLocations)
    // if (resetOverlappedLocations) {
    //   console.log("resetOverlappedLocations")
    // }

    if (isLocationAsset) {
      console.log('is location asset');
      if (reset) {
        console.log('reset');
        // console.log('need to reset');
        dispatch(resetOverlappedLocations(false));
        overlappedLocationsCopy = { ...initOverlappedLocations };
        console.log(overlappedLocationsCopy);
      } else {
        overlappedLocationsCopy = { ...overlappedLocations };
      }
      Object.keys(locationAssets).map((locationType) => {
        if (isArea(locationType)) {
          locationAssets[locationType].forEach((area) => {
            if (area.isVisible && maps.geometry.poly.containsLocation(latLng, area.polygon)) {
              overlappedLocationsCopy.area.push({
                id: area.location_id,
                name: area.location_name,
                asset: area.asset,
                type: area.type,
              });
            }
          });
        } else if (isLine(locationType)) {
          locationAssets[locationType].forEach((line) => {
            if (
              line.isVisible &&
              maps.geometry.poly.isLocationOnEdge(latLng, line.polyline, 10e-7)
            ) {
              overlappedLocationsCopy.line.push({
                id: line.location_id,
                name: line.location_name,
                asset: line.asset,
                type: line.type,
              });
            }
          });
        } else if (isPoint(locationType)) {
          console.log('is point');
          if (isLocationCluster) {
            console.log('is location cluster');
            locationAssets[locationType].forEach((point) => {
              console.log(point);
              overlappedLocationsCopy.point.push({
                id: point.location_id,
                name: point.location_name,
                asset: point.asset,
                type: point.type,
              });
            });
          } else {
            locationAssets[locationType].forEach((point) => {
              console.log(point);
              if (point.isVisible && latLng === point.marker.position) {
                overlappedLocationsCopy.point.push({
                  id: point.location_id,
                  name: point.location_name,
                  asset: point.asset,
                  type: point.type,
                });
              }
            });
          }

          console.log(overlappedLocationsCopy);
        }
      });

      setOverlappedLocations({ ...overlappedLocationsCopy });
    } else {
      console.log('clicked non area');
      dispatch(canShowSelection(false));
      // setResetOverlappedLocations(true);
      dispatch(resetOverlappedLocations(true));
      console.log(resetOverlappedLocations);
      setOverlappedLocations({ ...initOverlappedLocations });
    }
  };

  return { handleSelection };
};

export default useSelectionHandler;
