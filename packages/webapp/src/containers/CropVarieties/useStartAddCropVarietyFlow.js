import { useDispatch } from 'react-redux';
import { setPersistedPaths } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

export function useStartAddCropVarietyFlow() {
  const history = useHistory();
  const dispatch = useDispatch();
  const onAddCropVariety = useCallback((crop_id) => {
    dispatch(
      setPersistedPaths([
        `/crop/${crop_id}/add_crop_variety`,
        `/crop/${crop_id}/add_crop_variety/compliance`,
      ]),
    );
    history.push(`/crop/${crop_id}/add_crop_variety`);
  }, []);
  return {
    onAddCropVariety,
  };
}
