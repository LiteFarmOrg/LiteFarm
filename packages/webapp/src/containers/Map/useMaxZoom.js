import { useDispatch, useSelector } from 'react-redux';
import { mapCacheSelector, setMapCache } from './mapCacheSlice';
import { userFarmSelector } from '../userFarmSlice';
import { usePropRef } from '../../components/LocationPicker/SingleLocationPicker/usePropRef';
import { pointSelector } from '../locationSlice';

export function useMaxZoom() {
  const { maxZoom } = useSelector(mapCacheSelector);
  const { farm_id, grid_points } = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const setMaxZoom = (maxZoom) => {
    dispatch(setMapCache({ maxZoom, farm_id }));
  };
  const points = useSelector(pointSelector);

  const getMaxZoom = async (maps, map = null) => {
    if (!maxZoom) {
      const mapService = new maps.MaxZoomService();
      const allPoints = [{ point: grid_points }];
      const pointsCollections = [points.gate, points.water_valve, points.sensor];
      pointsCollections.forEach((collection) => {
        collection.forEach((element) => {
          if (
            !allPoints.some(
              (item) =>
                item.point.lat === element.point.lat && item.point.lng === element.point.lng,
            )
          ) {
            allPoints.push({ point: element.point });
          }
        });
      });
      const promises = allPoints.map(function (point) {
        return new Promise(function (resolve, reject) {
          mapService?.getMaxZoomAtLatLng(point.point, function (result) {
            if (result.status === 'OK') {
              resolve(result.zoom);
            } else {
              console.log('failed maps service promise', result.status);
              reject(result.status);
            }
          });
        });
      });
      Promise.all(promises)
        .then(function (results) {
          const minNumber = Math.min(...results);
          setMaxZoom(minNumber);
          if (map) map.setOptions({ maxZoom: minNumber });
        })
        .catch(function (error) {
          console.log('Error getting available zooms');
          setMaxZoom(18);
        });
    } else if (map) {
      map.setOptions({ maxZoom: maxZoom });
    }
  };
  const maxZoomRef = usePropRef(maxZoom);
  return { maxZoom, maxZoomRef, getMaxZoom };
}
