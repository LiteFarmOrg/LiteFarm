import { isArea, isLine, isPoint, locationEnum} from './constants';
import { useState, useEffect } from 'react';
import { canShowSelection, locations } from '../mapSlice';
import { useDispatch } from 'react-redux';
import history from '../../history';

const useSelectionHandler = () => {
  const initOverlappedLocations = {
    area: [],
    line: [],
    point: [],
  };

  const dispatch = useDispatch();
  let [overlappedLocations, setOverlappedLocations] = useState(initOverlappedLocations);

  const [dismissSelection, setDismissSelection] = useState(false);

  useEffect(() => {
    if (dismissSelection) {
      setOverlappedLocations(clone(initOverlappedLocations));
      setDismissSelection(false);
      return;
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
        history.push(
          `/${overlappedLocations.area[0].type}/${overlappedLocations.area[0].id}/details`,
        );
      } else if (
        overlappedLocations.area.length === 0 &&
        overlappedLocations.line.length === 1 &&
        overlappedLocations.point.length === 0
      ) {
        history.push(
          `/${overlappedLocations.line[0].type}/${overlappedLocations.line[0].id}/details`,
        );
      } else {
        if (overlappedLocations.point.length === 1) {
          history.push(
            `/${overlappedLocations.point[0].type}/${overlappedLocations.point[0].id}/details`,
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
  }, [overlappedLocations, dismissSelection]);

  const handleSelection = (latLng, locationAssets, maps, isLocationAsset, isLocationCluster) => {
    let overlappedLocationsCopy = clone(initOverlappedLocations);

    if (isLocationAsset) {
      Object.keys(locationAssets).map((locationType) => {
        const isAreaLine = [locationEnum.watercourse, locationEnum.buffer_zone].includes(locationType);
        if (isArea(locationType) || isAreaLine) {
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
          if (isLocationCluster) {
            locationAssets[locationType].forEach((point) => {
              overlappedLocationsCopy.point.push({
                id: point.location_id,
                name: point.location_name,
                asset: point.asset,
                type: point.type,
              });
            });
          } else {
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
        }
      });

      setOverlappedLocations(clone(overlappedLocationsCopy));
    } else {
      setDismissSelection(true);
      dispatch(canShowSelection(false));
    }
  };

  return { handleSelection };
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default useSelectionHandler;
