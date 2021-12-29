import { useDispatch, useSelector } from 'react-redux';
import {
  hookFormPersistedPathsSetSelector,
  hookFormPersistHistoryStackSelector,
  hookFormPersistSelector,
  hookFormPersistUnMount,
  popHistoryStack,
  pushHistoryStack,
  replaceHistoryStack,
  resetAndUnLockFormData,
} from './hookFormPersistSlice';
import { useCallback, useEffect, useLayoutEffect } from 'react';
import history from '../../../history';

export default function useHookFormPersist(
  getValues = () => ({}),
  persistedPathNames = [],
  setValue,
  shouldDirty = true,
) {
  const dispatch = useDispatch();

  const historyStack = useSelector(hookFormPersistHistoryStackSelector);
  useEffect(() => {
    if (!historyStack.length) {
      dispatch(pushHistoryStack(history.location.pathname));
    }
  }, []);

  const historyCancel = useCallback(() => {
    history.go(-historyStack.length);
  }, [historyStack]);


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
        switch (history.action) {
        case 'PUSH':
          dispatch(pushHistoryStack(history.location.pathname));
          break;
        case 'POP':
          dispatch(popHistoryStack());
          break;
        case 'REPLACE':
          dispatch(replaceHistoryStack(history.location.pathname));
          break;
        default:
          break;
        }
      } else {
        if (history.action === 'PUSH') {
          const pathname = history.location.pathname;
          const unlisten = history.listen(() => {
            if (history.action === 'POP') {
              unlisten();
              history.push(pathname);
            }
          });
          history.go(-historyStack.length - 1);
        }
        dispatch(resetAndUnLockFormData());
      }
    };
  }, []);
  //TODO: remove and refactor location multistep forms LF-2122
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

  return { persistedData: formData, historyCancel };
}

const isValueValid = (value) => value !== null && value !== '' && value !== undefined;
