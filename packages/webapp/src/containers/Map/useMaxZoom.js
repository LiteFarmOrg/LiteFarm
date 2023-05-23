import { useDispatch, useSelector } from 'react-redux';
import { mapCacheSelector, setMapCache, setRetrievedPoints } from './mapCacheSlice';
import { userFarmSelector } from '../userFarmSlice';
import { usePropRef } from '../../components/LocationPicker/SingleLocationPicker/usePropRef';
import { pointSelector } from '../locationSlice';
import { DEFAULT_MAX_ZOOM } from './constants';

export function useMaxZoom() {
  const { maxZoom, retrievedPoints } = useSelector(mapCacheSelector);
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
      pointsCollections.forEach(({ point }) => {
        if (
          ![...pointsToQuery, ...retrievedPoints].some(
            (item) => item.point.lat === point.lat && item.point.lng === point.lng,
          )
        ) {
          pointsToQuery.push({ point: point });
        }
      });
      const promises = pointsToQuery.map(function ({ point }) {
        return new Promise(function (resolve, reject) {
          mapService.getMaxZoomAtLatLng(point, function (result) {
            if (result.status === 'OK') {
              resolve({ point: point, maxZoom: result.zoom });
            } else {
              console.log('failed maps service promise', result.status);
              reject(result.status);
            }
          });
        });
      });
      Promise.all(promises)
        .then(function (results) {
          const cachedAndActivePoints = retrievedPoints.filter((element) =>
            pointsCollections.some(
              ({ point }) => point.lat === element.point.lat && point.lng === element.point.lng,
            ),
          );
          const maxZooms = [...results, ...cachedAndActivePoints].map(({ maxZoom }) => maxZoom);
          const minNumber = Math.min(...maxZooms);
          setMaxZoom(minNumber);
          dispatch(
            setRetrievedPoints({
              farm_id,
              retrievedPoints: [...cachedAndActivePoints, ...results],
            }),
          );
          if (map) map.setOptions({ maxZoom: minNumber });
        })
        .catch(function (error) {
          console.log('Error getting available zooms: ', error);
          const previousMaxZooms = retrievedPoints.map(({ maxZoom }) => maxZoom);
          const fallbackZoom =
            previousMaxZooms.length > 0 ? Math.min(...previousMaxZooms) : DEFAULT_MAX_ZOOM;
          setMaxZoom(fallbackZoom);
          if (map) map.setOptions({ maxZoom: fallbackZoom });
        });
    } else if (map) {
      map.setOptions({ maxZoom: maxZoom });
    }
  };
  const maxZoomRef = usePropRef(maxZoom);
  return { maxZoom, maxZoomRef, getMaxZoom };
}
