import { containsCrops, isArea, isAreaLine, isLine, isPoint } from './constants';
import { useEffect, useState } from 'react';
import { canShowSelection, canShowSelectionSelector, locations } from '../mapSlice';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../history';
import { cloneObject } from '../../util';
import styles from './styles.module.scss';
import { areaStyles, lineStyles } from './mapStyles';

const useLocationsSelectionHandler = (
  selectingOnly,
  multipleLocations,
  selectedLocationRef,
  selectedLocationsMapRef,
  removeLocation,
  addLocation,
  setSelectedLocation,
  assetGeometries
) => {
  const initOverlappedLocations = {
    area: [],
    line: [],
    point: [],
  };

  const dispatch = useDispatch();

  const [overlappedLocations, setOverlappedLocations] = useState(initOverlappedLocations);
  const [overlappedPolygons, setOverlappedPolygons] = useState(initOverlappedLocations);

  const addOverlappedPolygon = (type, polygon) => {
    let typeArr = overlappedPolygons[type];
    typeArr.push(polygon);
    const newObj = { ...overlappedPolygons, [type]: typeArr };
    setOverlappedPolygons(newObj);
  }

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
        //console.log(overlappedLocations);
        if (!selectingOnly) {
          containsCrops(overlappedLocations.area[0].type)
            ? history.push(
              `/${overlappedLocations.area[0].type}/${overlappedLocations.area[0].id}/crops`,
            )
            : history.push(
              `/${overlappedLocations.area[0].type}/${overlappedLocations.area[0].id}/details`,
            );
        } else {
          // let a = assetGeometries['field'][0];
          // console.log(a);
          // selectArea(a.polygon, a.marker, {name: a.name, location_id: a.location_id, type: a.type}, a.polyline, a.polygon);
          console.log(overlappedLocations.area[0].id);
          //addLocation(overlappedLocations.area[0].id);
        }
      } else if (
        overlappedLocations.area.length === 0 &&
        overlappedLocations.line.length === 1 &&
        overlappedLocations.point.length === 0
      ) {
        if (!selectingOnly) {
          history.push(
            `/${overlappedLocations.line[0].type}/${overlappedLocations.line[0].id}/details`,
          );
        }
      } else {
        if (overlappedLocations.point.length === 1) {
          if (!selectingOnly) {
            history.push(
              `/${overlappedLocations.point[0].type}/${overlappedLocations.point[0].id}/details`,
            );
          }
        } else {
          const locationArray = [];
          console.log(overlappedPolygons);
          console.log(overlappedLocations);
          overlappedLocations.point.forEach((point) => {
            if (locationArray.length < 4) locationArray.push(point);
          });
          overlappedLocations.line.forEach((line) => {
            if (locationArray.length < 4) locationArray.push(line);
          });
          overlappedLocations.area.forEach((area) => {
            if (locationArray.length < 4) locationArray.push(area);
          });
          //console.log(locationArray);
          dispatch(canShowSelection(true));
          dispatch(locations(locationArray));
        }
      }
    }
  }, [overlappedLocations, dismissSelection]);

  const handleSelection = (latLng, locationAssets, maps, isLocationAsset, isLocationCluster) => {
    console.log(locationAssets);
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
              addOverlappedPolygon('area', area.polygon);
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
              addOverlappedPolygon('line', line.polygon);
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
      console.log(overlappedLocationsCopy);
    } else {
      setDismissSelection(true);
      dispatch(canShowSelection(false));
    }
  };

  const resetStyles = (color, polygon) => {
    const reset_opacity = 0.5;
    polygon.setOptions({
      fillColor: color,
      fillOpacity: reset_opacity,
    });
  };

  const resetAreaStyles = (p, areaColor, marker, markerColor, area, selected) => {
    p.setOptions({
      fillColor: areaColor,
      fillOpacity: selected ? 1.0 : 0.5,
    });
    marker.setOptions({
      label: {
        text: area.name,
        color: markerColor,
        fontSize: '16px',
        className: styles.mapLabel,
      }
    });
  }

  const resetLineStyles = (p, lineColor, selected) => {
    p.setOptions({
      fillColor: lineColor,
      fillOpacity: selected ? 1.0 : 0.5,
    });
  }

  const selectArea = (p, marker, area, polyline, polygon) => {

    if (!multipleLocations && selectedLocationRef.current) {
      if (selectedLocationRef.current.asset === 'line') {
        resetStyles(lineStyles[selectedLocationRef.current.line.type].colour, selectedLocationRef.current.polygon);
      } else {
        resetStyles(areaStyles[selectedLocationRef.current.area.type].colour, selectedLocationRef.current.polygon);
        selectedLocationRef.current.marker.setOptions({
          label: {
            text: selectedLocationRef.current.area.name,
            color: 'white',
            fontSize: '16px',
            className: styles.mapLabel,
          }
        });
      }
    }

    if (multipleLocations) {
      if (selectedLocationsMapRef.current[area.location_id]) {
        resetAreaStyles(p, areaStyles[area.type].colour, marker, 'white', area, false);
        removeLocation(area.location_id);
      } else {
        resetAreaStyles(p, areaStyles[area.type].selectedColour, marker, '#282B36', area, true);
        addLocation(area.location_id);
      }
    } else {
      if (selectedLocationRef.current && selectedLocationRef.current.locationId === area.location_id) {
        setSelectedLocation(null);
        return;
      }

      setSelectedLocation({
        area,
        polygon,
        polyline,
        marker,
        asset: 'area',
        locationId: area.location_id,
      });
      resetAreaStyles(p, areaStyles[area.type].selectedColour, marker, '#282B36', area, true);
    }
  };

  const selectLine = (p, line, polyline, polygon) => {
    if (!multipleLocations && selectedLocationRef.current) {
      if (selectedLocationRef.current.asset === 'line') {
        resetStyles(lineStyles[selectedLocationRef.current.line.type].colour, selectedLocationRef.current.polygon);
      } else {
        resetStyles(areaStyles[selectedLocationRef.current.area.type].colour, selectedLocationRef.current.polygon);
        selectedLocationRef.current.marker.setOptions({
          label: {
            text: selectedLocationRef.current.area.name,
            color: 'white',
            fontSize: '16px',
            className: styles.mapLabel,
          }
        });
      }
    }

    if (multipleLocations) {
      if (selectedLocationsMapRef.current[line.location_id]) {
        resetLineStyles(p, lineStyles[line.type].colour, false);
        removeLocation(line.location_id);
      } else {
        resetLineStyles(p, lineStyles[line.type].selectedColour, true);
        addLocation(line.location_id);
      }
    } else {
      if (selectedLocationRef.current && selectedLocationRef.current.locationId === line.location_id) {
        setSelectedLocation(null);
        return;
      }

      setSelectedLocation({
        line,
        polygon,
        asset: 'line',
        locationId: line.location_id,
      });

      resetLineStyles(p, lineStyles[line.type].selectedColour, true);
    }
  };


  const dismissSelectionModal = () => setDismissSelection(true);

  return { handleSelection, dismissSelectionModal, selectArea };
};

export default useLocationsSelectionHandler;
