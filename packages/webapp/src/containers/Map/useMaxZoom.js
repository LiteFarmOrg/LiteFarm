import { useDispatch, useSelector } from 'react-redux';
import { mapCacheSelector, setMapCache, setRetrievedPoints } from './mapCacheSlice';
import { userFarmSelector } from '../userFarmSlice';
import { usePropRef } from '../../components/LocationPicker/SingleLocationPicker/usePropRef';
import { pointSelector } from '../locationSlice';
import { DEFAULT_MAX_ZOOM } from './constants';

export function useMaxZoom() {
  const { maxZoom, previousMaxZoom, retrievedPoints } = useSelector(mapCacheSelector);
  const { farm_id, grid_points } = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const setMaxZoom = (maxZoom) => {
    dispatch(setMapCache({ maxZoom, farm_id }));
  };
  const points = useSelector(pointSelector);

  const getMaxZoom = async (maps, map = null) => {
    if (!maxZoom) {
      const mapService = new maps.MaxZoomService();
      const pointsToQuery = [];
      const pointsCollections = [
        { point: grid_points },
        ...points.gate,
        ...points.water_valve,
        ...points.sensor,
      ];
      pointsCollections.forEach((element) => {
        if (
          !pointsToQuery.some(
            (item) => item.lat === element.point.lat && item.lng === element.point.lng,
          ) &&
          !retrievedPoints.some(
            (item) => item.lat === element.point.lat && item.lng === element.point.lng,
          )
        ) {
          pointsToQuery.push(element.point);
        }
      });
      const promises = pointsToQuery.map(function (point) {
        return new Promise(function (resolve, reject) {
          mapService?.getMaxZoomAtLatLng(point, function (result) {
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
          const maxZooms = previousMaxZoom ? [...results, previousMaxZoom] : results;
          const minNumber = Math.min(...maxZooms);
          setMaxZoom(minNumber);
          dispatch(
            setRetrievedPoints({
              farm_id,
              retrievedPoints: [...pointsToQuery, ...retrievedPoints],
            }),
          );
          if (map) map.setOptions({ maxZoom: minNumber });
        })
        .catch(function (error) {
          console.log('Error getting available zooms');
          if (previousMaxZoom) {
            setMaxZoom(previousMaxZoom);
          } else {
            setMaxZoom(DEFAULT_MAX_ZOOM);
          }
        });
    } else if (map) {
      map.setOptions({ maxZoom: maxZoom });
    }
  };
  const maxZoomRef = usePropRef(maxZoom);
  return { maxZoom, maxZoomRef, getMaxZoom };
}
