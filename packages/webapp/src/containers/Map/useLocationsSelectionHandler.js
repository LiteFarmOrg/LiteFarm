import { containsCrops, isArea, isAreaLine, isLine, isPoint } from './constants';
import { useEffect, useState } from 'react';
import { canShowSelection, canShowSelectionSelector, locations, setSelectedSelector } from '../mapSlice';
import { useDispatch, useSelector } from 'react-redux';
import { cloneObject } from '../../util';
import styles from './styles.module.scss';
import { areaStyles, lineStyles, activeIcons, hoverIcons, icons } from './mapStyles';


const useLocationsSelectionHandler = (
  selectingOnly,
  multipleLocations,
  selectedLocationRef,
  selectedLocationsMapRef,
  selectedLocationsMap,
  removeLocation,
  addLocation,
  setSelectedLocation,
) => {
  const initOverlappedLocations = {
    area: [],
    line: [],
    point: [],
    assets: {},
  };

  const initOverLappedAssets = {
    area: {},
    line: {},
    point: {},
  };

  const dispatch = useDispatch();

  const [overlappedLocations, setOverlappedLocations] = useState(initOverlappedLocations);
  const [dismissSelection, setDismissSelection] = useState(false);
  const showSelection = useSelector(canShowSelectionSelector);

  const selected = useSelector(setSelectedSelector);

  useEffect(() => {
    if (overlappedLocations.area.length > 0 || overlappedLocations.line.length > 0 || overlappedLocations.point.length > 0) {
      if (selected.asset === 'area') {
        let a = overlappedLocations.assets.area[selected.id];
        selectArea(a.polygon, a.marker, a.area, a.polyline, a.polygon);
      } else if (selected.asset === 'line') {
        if (overlappedLocations.assets.line[selected.id]) {
          let l = overlappedLocations.assets.line[selected.id];
          selectLine(l.polyline, l.line);
        } else {
          let l = overlappedLocations.assets.area[selected.id];
          selectAreaLine(l.polygon, l.area, l.polyline, l.polygon);
        }
      } else if (selected.asset === 'point') {
        let p = overlappedLocations.assets.point[overlappedLocations.point[0].id];
        selectPoint(p.marker, p.type, p.point);
      }
    }
  }, [selected]);

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
        if (overlappedLocations.area[0].asset === 'line') {
          let l = overlappedLocations.assets.area[overlappedLocations.area[0].id];
          selectAreaLine(l.polygon, l.area, l.polyline, l.polygon);
        } else {
          let a = overlappedLocations.assets.area[overlappedLocations.area[0].id];
          selectArea(a.polygon, a.marker, a.area, a.polyline, a.polygon);
        }
      } else if (
        overlappedLocations.area.length === 0 &&
        overlappedLocations.line.length === 1 &&
        overlappedLocations.point.length === 0
      ) {
        let l = overlappedLocations.assets.line[overlappedLocations.line[0].id];
        selectLine(l.polyline, l.line);
      } else {
        if (overlappedLocations.point.length === 1) {
          let p = overlappedLocations.assets.point[overlappedLocations.point[0].id];
          selectPoint(p.marker, p.type, p.point);
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
    let overlappedLocationsCopy = cloneObject(initOverlappedLocations);
    let overLappedAssetsCopy = cloneObject(initOverLappedAssets);
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
              overLappedAssetsCopy.area[area.location_id] = {
                polygon: area.polygon,
                marker: area.marker,
                polyline: area.polyline,
                area: { name: area.location_name, location_id: area.location_id, type: area.type },
              };
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
              overLappedAssetsCopy.line[line.location_id] = {
                polygon: line.polygon,
                marker: line.marker,
                polyline: line.polyline,
                line: { name: line.location_name, location_id: line.location_id, type: line.type },
              };
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
              overLappedAssetsCopy.point[point.location_id] = {
                marker: point.marker,
                point: { name: point.location_name, location_id: point.location_id, type: point.type },
              };
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
                overLappedAssetsCopy.point[point.location_id] = {
                  marker: point.marker,
                  point: { name: point.location_name, location_id: point.location_id, type: point.type },
                };
              }
            });
          }
        }
      });

      setOverlappedLocations({ ...cloneObject(overlappedLocationsCopy), assets: overLappedAssetsCopy });
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

  const resetAreaLineStyles = (p, lineColor, selected) => {
    p.setOptions({
      fillColor: lineColor,
      fillOpacity: selected ? 1.0 : 0.5,
    });
  }

  const resetPointStyles = (marker, type, selected) => {
    marker.setOptions({ icon: selected ? activeIcons[type] : icons[type] });
  }

  const resetLineStyles = (polyline, selected) => {
    polyline.setOptions({
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
      if (selectedLocationsMapRef[area.location_id]) {
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

  const selectAreaLine = (p, line, polyline, polygon) => {
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
      if (selectedLocationsMapRef[line.location_id]) {
        debugger;
        resetAreaLineStyles(p, lineStyles[line.type].colour, false);
        removeLocation(line.location_id);
      } else {
        resetAreaLineStyles(p, lineStyles[line.type].selectedColour, true);
        addLocation(line.location_id);
        console.log(line.location_id);
        console.log(selectedLocationsMapRef);
        debugger;
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

      resetAreaLineStyles(p, lineStyles[line.type].selectedColour, true);
    }
  };

  const selectLine = (polyline, line) => {
    if (selectedLocationsMapRef[line.location_id]) {
      debugger;
      resetLineStyles(polyline, false);
      removeLocation(line.location_id);
    } else {
      resetLineStyles(polyline, true);
      addLocation(line.location_id);
      console.log(line.location_id);
      console.log(selectedLocationsMapRef);
      debugger;
    }
  };


  const selectPoint = (marker, type, point) => {
    if (selectedLocationsMapRef[point.location_id]) {
      resetPointStyles(marker, type, false);
      removeLocation(point.location_id);
    } else {
      resetPointStyles(marker, type, true);
      addLocation(point.location_id);
    }
  }


  const dismissSelectionModal = () => setDismissSelection(true);

  return { handleSelection, dismissSelectionModal, selectArea, selectPoint, selectAreaLine };
};

export default useLocationsSelectionHandler;
