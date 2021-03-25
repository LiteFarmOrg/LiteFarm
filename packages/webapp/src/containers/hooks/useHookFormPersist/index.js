import { useDispatch, useSelector } from 'react-redux';
import { hookFormPersistSelector, upsertFormData } from './hookFormPersistSlice';
import { useEffect } from 'react';

export default function useHookFormPersist(hookFormData, setValue) {
  const dispatch = useDispatch();
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    for (const key in formData) {
      setValue(key, formData[key]);
    }
    return () => dispatch(upsertFormData(hookFormData));
  }, []);
  return { persistedData: formData };
}
