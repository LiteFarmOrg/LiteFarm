import { isArea, isLine, isPoint } from './constants';
import { useState } from 'react';

const useSelectionHandler = () => {
  const initOverlappedLocations = {
    area: [],
    line: [],
    point: [],
  };

  let [overlappedLocations, setOverlappedLocations] = useState(initOverlappedLocations);

  let areaCounter = 0;
  let lineCounter = 0;
  let pointCounter = 0;

  const handleSelection = (latLng, locationAssets, maps, isLocationAsset) => {
    // If user clicks on a location
    if (isLocationAsset) {
      Object.keys(locationAssets).map((locationType) => {
        // if (overlappedLocations.length === 4) {
        //   return;
        // }
        if (isArea(locationType)) {
          locationAssets[locationType].forEach((area) => {
            if (area.isVisible && maps.geometry.poly.containsLocation(latLng, area.polygon)) {
              areaCounter += 1;
              overlappedLocations.area.push({ id: area.location_id, name: area.location_name });
            }
          });
        } else if (isLine(locationType)) {
          locationAssets[locationType].forEach((line) => {
            if (
              line.isVisible &&
              maps.geometry.poly.isLocationOnEdge(latLng, line.polyline, 10e-7)
            ) {
              lineCounter += 1;
              overlappedLocations.line.push({ id: line.location_id, name: line.location_name });
            }
          });
        } else if (isPoint(locationType)) {
          locationAssets[locationType].forEach((point) => {
            if (point.isVisible && latLng === point.marker.position) {
              pointCounter += 1;
              overlappedLocations.point.push({ id: point.location_id, name: point.location_name });
            }
          });
        }
      });

      console.log(overlappedLocations);

      // Exactly 1 area
      if (areaCounter === 1 && lineCounter === 0 && pointCounter === 0) {
        console.log('exactly 1 area');
        const location = overlappedLocations.area[0];
        console.log(location);
      }
      // Exactly 1 line
      else if (areaCounter === 0 && lineCounter === 1 && pointCounter === 0) {
        console.log('exactly 1 line');
        const location = overlappedLocations.line[0];
        console.log(location);
      }
      // 2 or more locations
      else {
        console.log('2 or more locations');
        // Exactly 1 point
        if (pointCounter === 1) {
          console.log('exactly 1 point');
          const location = overlappedLocations.point[0];
          console.log(location);
        } else {
          console.log(overlappedLocations);
        }
      }
    }
  };

  return { handleSelection };
};

export default useSelectionHandler;
