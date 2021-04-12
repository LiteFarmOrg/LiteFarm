import { isArea, isLine, isPoint } from './constants';
import { useState, useEffect } from 'react';
import { canShowSelection, locations, canShowSelectionSelector } from '../mapSlice';
import { useDispatch, useSelector } from 'react-redux';

const useSelectionHandler = () => {
  const initOverlappedLocations = {
    area: [],
    line: [],
    point: [],
  };

  const dispatch = useDispatch();

  const [overlappedLocations, setOverlappedLocations] = useState(initOverlappedLocations);
  const showSelection = useSelector(canShowSelectionSelector);

  useEffect(() => {
    if (!showSelection) {
      console.log('dismiss selection');
      setOverlappedLocations(initOverlappedLocations);
    }
    if (
      overlappedLocations.area.length > 0 ||
      overlappedLocations.line.length > 0 ||
      overlappedLocations.point.length > 0
    ) {
      if (
        overlappedLocations.area.length === 1 &&
        overlappedLocations.line.length === 0 &&
        overlappedLocations.point.length === 0
      ) {
        // TODO: Goto edit view
        console.log('exactly 1 area');
      } else if (
        overlappedLocations.area.length === 0 &&
        overlappedLocations.line.length === 1 &&
        overlappedLocations.point.length === 0
      ) {
        // TODO: Goto edit view
        console.log('exactly 1 line');
      } else {
        if (overlappedLocations.point.length === 1) {
          // TODO: Goto edit view
          console.log('exactly 1 point');
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
          // dispatch(showSelection(false))
          // dispatch(storeOverlappedLocations(locations))
        }
      }
    }
  }, [overlappedLocations]);

  const handleSelection = (latLng, locationAssets, maps, isLocationAsset) => {
    const overlappedLocationsCopy = { ...overlappedLocations };
    if (isLocationAsset) {
      if (showSelection) {
        console.log('dispatch false');
        dispatch(canShowSelection(false));
        setOverlappedLocations(initOverlappedLocations);
        console.log(overlappedLocations);
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
          locationAssets[locationType].forEach((point) => {
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
      });

      setOverlappedLocations({ ...overlappedLocationsCopy });
      console.log(overlappedLocations);
      // setOverlappedLocations(initOverlappedLocations)
    } else {
      dispatch(canShowSelection(false));
    }
  };

  return { handleSelection };
};

export default useSelectionHandler;
