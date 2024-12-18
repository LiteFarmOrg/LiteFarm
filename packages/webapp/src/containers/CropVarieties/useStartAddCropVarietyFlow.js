import { useDispatch } from 'react-redux';
import { setPersistedPaths } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useStartAddCropVarietyFlow() {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const onAddCropVariety = useCallback((crop_id) => {
    dispatch(
      setPersistedPaths([
        `/crop/${crop_id}/add_crop_variety`,
        `/crop/${crop_id}/add_crop_variety/compliance`,
      ]),
    );
    navigate(`/crop/${crop_id}/add_crop_variety`);
  }, []);
  return {
    onAddCropVariety,
  };
}
