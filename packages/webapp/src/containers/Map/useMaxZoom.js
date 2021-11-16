import { useDispatch, useSelector } from 'react-redux';
import { mapCacheSelector, setMapCache } from './mapCacheSlice';
import { userFarmSelector } from '../userFarmSlice';
import { usePropRef } from '../../components/LocationPicker/SingleLocationPicker/usePropRef';

export function useMaxZoom() {
  const { maxZoom } = useSelector(mapCacheSelector);
  const { farm_id, grid_points } = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const setMaxZoom = maxZoom => {
    dispatch(setMapCache({ maxZoom, farm_id }));
  };
  const getMaxZoom = maps => {
    if (!maxZoom) {
      new maps.MaxZoomService()?.getMaxZoomAtLatLng(grid_points, (result) => {
        if (result.status === 'OK') {
          setMaxZoom(result.zoom);
        }
      });
    }
  };
  const maxZoomRef = usePropRef(maxZoom);
  return { maxZoom, maxZoomRef, getMaxZoom };
}
