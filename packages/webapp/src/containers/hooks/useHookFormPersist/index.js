import { useDispatch, useSelector } from 'react-redux';
import {
  hookFormPersistedPathsSetSelector,
  hookFormPersistSelector,
  hookFormPersistUnMount,
  resetAndUnLockFormData,
} from './hookFormPersistSlice';
import { useEffect, useLayoutEffect } from 'react';
import history from '../../../history';

export default function useHookFormPersist(
  getValues = () => ({}),
  persistedPathNames = [],
  setValue,
  shouldDirty = true,
) {
  const dispatch = useDispatch();
  const formData = useSelector(hookFormPersistSelector);
  const persistedPathsSet = useSelector(hookFormPersistedPathsSetSelector);
  useLayoutEffect(() => {
    return () => {
      if (history.location.state?.forceReset) {
        dispatch(resetAndUnLockFormData());
      } else if (
        persistedPathsSet.has(history.location.pathname) ||
        persistedPathNames.includes(history.location.pathname)
      ) {
        dispatch(hookFormPersistUnMount(getValues()));
      } else {
        dispatch(resetAndUnLockFormData());
      }
    };
  }, []);
  useEffect(() => {
    if (!!setValue) {
      for (const key in formData) {
        isValueValid(formData[key]) &&
          setValue(key, formData[key], { shouldValidate: true, shouldDirty });
      }
      const initiatedField = Object.keys(getValues());
      const setHiddenValues = setTimeout(() => {
        for (const key in formData) {
          !initiatedField.includes(key) &&
            isValueValid(formData[key]) &&
            setValue(key, formData[key], { shouldValidate: true, shouldDirty });
        }
      }, 100);
      return () => clearTimeout(setHiddenValues);
    }
  }, [history.location.pathname, formData]);

  return { persistedData: formData };
}

const isValueValid = (value) => value !== null && value !== '' && value !== undefined;
