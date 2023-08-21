import { containsCrops, isArea, isAreaLine, isLine, isPoint, locationEnum } from './constants';
import { useEffect, useState } from 'react';
import { canShowSelection, canShowSelectionSelector, locations } from '../mapSlice';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../history';
import { cloneObject } from '../../util';

/**
 *
 * Do not modify, copy or reuse
 */
const useSelectionHandler = () => {
  const initOverlappedLocations = {
    area: [],
    line: [],
    point: [],
  };

  const dispatch = useDispatch();
  const [overlappedLocations, setOverlappedLocations] = useState(initOverlappedLocations);

  const [dismissSelection, setDismissSelection] = useState(false);
  const showSelection = useSelector(canShowSelectionSelector);

  useEffect(() => {
    if (showSelection) {
      dispatch(canShowSelection(false));
    }
    if (dismissSelection) {
      setOverlappedLocations(cloneObject(initOverlappedLocations));
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
        containsCrops(overlappedLocations.area[0].type)
          ? history.push(
              `/${overlappedLocations.area[0].type}/${overlappedLocations.area[0].id}/crops`,
            )
          : history.push(
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
          if (
            overlappedLocations.point[0].type === locationEnum.sensor &&
            overlappedLocations.point[0].preview
          ) {
            const locationArray = [];
            overlappedLocations.point.forEach((point) => {
              if (locationArray.length < 4) locationArray.push(point);
            });
            dispatch(canShowSelection(true));
            dispatch(locations(locationArray));
          } else if (overlappedLocations.point[0].type === locationEnum.sensor) {
            history.push(
              `/${overlappedLocations.point[0].type}/${overlappedLocations.point[0].id}/readings`,
            );
          } else {
            history.push(
              `/${overlappedLocations.point[0].type}/${overlappedLocations.point[0].id}/details`,
            );
          }
        } else {
          const locationArray = [];
          overlappedLocations.point.forEach((point) => {
            locationArray.push(point);
          });
          overlappedLocations.line.forEach((line) => {
            locationArray.push(line);
          });
          overlappedLocations.area.forEach((area) => {
            locationArray.push(area);
          });
          dispatch(canShowSelection(true));
          dispatch(locations(locationArray));
        }
      }
    }
  }, [overlappedLocations, dismissSelection]);

  const handleSelection = (
    latLng,
    locationAssets,
    maps,
    isLocationAsset,
    isLocationCluster,
    isSensor,
  ) => {
    let overlappedLocationsCopy = cloneObject(initOverlappedLocations);
    if (isLocationAsset) {
      Object.keys(locationAssets).map((locationType) => {
        if (isArea(locationType) || isAreaLine(locationType)) {
          locationAssets[locationType].forEach((area) => {
            if (
              area?.polygon?.visible &&
              maps.geometry.poly.containsLocation(latLng, area.polygon)
            ) {
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
              line.polyline.visible &&
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
            locationAssets[locationType]
              .sort((a, b) => {
                if (a.location_name < b.location_name) {
                  return -1;
                } else if (b.location_name > a.location_name) {
                  return 1;
                } else {
                  return 0;
                }
              })
              .forEach((point) => {
                overlappedLocationsCopy.point.push({
                  id: point.location_id,
                  name: point.location_name,
                  asset: point.asset,
                  type: point.type,
                });
              });
          } else if (isSensor) {
            locationAssets[locationType].forEach((point) => {
              overlappedLocationsCopy.point.push({
                id: point.location_id,
                name: point.location_name,
                asset: point.asset,
                type: point.type,
                preview: true,
              });
            });
          } else {
            locationAssets[locationType].forEach((point) => {
              if (point.marker.visible && latLng === point.marker.position) {
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

      setOverlappedLocations(cloneObject(overlappedLocationsCopy));
    } else {
      setDismissSelection(true);
      dispatch(canShowSelection(false));
    }
  };

  const dismissSelectionModal = () => setDismissSelection(true);

  return { handleSelection, dismissSelectionModal };
};

export default useSelectionHandler;
