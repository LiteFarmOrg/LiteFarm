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

/**
 * Persists form values when navigating between routes.
 *
 * @param {Function} getValues - Returns the current form values.
 * @param {string[]} persistedPathNames - Route paths where form data should be preserved.
 * @param {string[]} formFieldsToKeep - Field names that should not be removed during cleanup, even if null or empty.
 * @returns {{ persistedData: any, historyCancel: Function }}
 */
export default function useHookFormPersist(
  getValues = () => ({}),
  persistedPathNames = [],
  formFieldsToKeep = [],
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
        dispatch(
          hookFormPersistUnMount({ values: getValues(), propertiesToKeep: formFieldsToKeep }),
        );
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
        const pathname = history.location.pathname;
        const state = history.location.state;
        dispatch(resetAndUnLockFormData());
        if (history.action === 'PUSH') {
          const unlisten = history.listen(() => {
            if (history.action === 'POP') {
              unlisten();
              history.push(pathname, state);
            }
          });
          history.go(-(historyStack.length || 1) - 1);
        } else if (history.action === 'POP') {
          const unlisten = history.listen(() => {
            if (history.action === 'POP') {
              unlisten();
              history.push(pathname, state);
            }
          });
          history.back();
        }
      }
    };
  }, []);

  return { persistedData: formData, historyCancel };
}

const isValueValid = (value) => value !== null && value !== '' && value !== undefined;
