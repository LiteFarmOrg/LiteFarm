import { useDispatch, useSelector } from 'react-redux';
import {
  hookFormPersistSelector,
  hookFormPersistUnMount,
  resetAndUnLockFormData,
} from './hookFormPersistSlice';
import { useEffect, useLayoutEffect } from 'react';
import history from '../../../history';

export default function useHookFormPersist(prevPathname, getValues, setValue) {
  const dispatch = useDispatch();
  const formData = useSelector(hookFormPersistSelector);
  useLayoutEffect(() => {
    return () => {
      if (history.location.pathname === prevPathname) {
        dispatch(hookFormPersistUnMount(getValues()));
      } else {
        dispatch(resetAndUnLockFormData());
      }
    };
  }, []);
  useEffect(() => {
    for (const key in formData) {
      setValue(key, formData[key], { shouldValidate: true, shouldDirty: true });
    }
    const initiatedField = Object.keys(getValues());
    const setHiddenValues = setTimeout(() => {
      for (const key in formData) {
        !initiatedField.includes(key) &&
          setValue(key, formData[key], { shouldValidate: true, shouldDirty: true });
      }
    }, 100);
    return () => clearTimeout(setHiddenValues);
  }, []);

  return { persistedData: formData };
}
