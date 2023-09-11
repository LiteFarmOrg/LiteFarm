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

export default function useHookFormPersist(getValues = () => ({}), persistedPathNames = []) {
  const dispatch = useDispatch();

  const historyStack = useSelector(hookFormPersistHistoryStackSelector);

  useEffect(() => {
    // if historyStack is empty, add the current path
    if (!historyStack.length) {
      dispatch(pushHistoryStack(history.location.pathname));
    }
  }, []);

  // Go back to the previous page of the first page of the form
  const historyCancel = useCallback(() => {
    history.go(-historyStack.length);
  }, [historyStack]);

  const formData = useSelector(hookFormPersistSelector);
  const persistedPathsSet = useSelector(hookFormPersistedPathsSetSelector);

  useLayoutEffect(() => {
    // before the component is unmounted...
    return () => {
      // not in use...
      if (history.location.state?.forceReset) {
        // Reset to the initial state
        dispatch(resetAndUnLockFormData());
      } else if (
        // when the user is still in the form
        persistedPathsSet.has(history.location.pathname) ||
        persistedPathNames.includes(history.location.pathname)
      ) {
        // getCorrectedPayload (removeNullValues) - what for? maybe to cleanup... when changing radio button or something
        dispatch(hookFormPersistUnMount(getValues()));
        switch (history.action) {
          // when going to the next page
          case 'PUSH':
            dispatch(pushHistoryStack(history.location.pathname));
            break;
          // when going back to the previous page
          case 'POP':
            dispatch(popHistoryStack());
            break;
          // ???
          case 'REPLACE':
            console.log('REPLACE... replacing the last path with current path');
            dispatch(replaceHistoryStack(history.location.pathname));
            break;
          default:
            break;
        }
      } else {
        // when the user is about to get out of the form
        const pathname = history.location.pathname;
        const state = history.location.state;
        dispatch(resetAndUnLockFormData());
        if (history.action === 'PUSH') {
          // when the user goes to a page outside the form by completing the form or clicking a link
          // 1. start listening...
          const unlisten = history.listen(() => {
            if (history.action === 'POP') {
              console.log('PUSH', pathname);
              // 3. unlisten
              unlisten();
              // 4. push the path the user is going to
              history.push(pathname, state);
            }
          });
          console.log('history.go');
          // 2. go back to the previous page of the first page of the form
          history.go(-(historyStack.length || 1) - 1);
        } else if (history.action === 'POP') {
          // when the user goes back to the previous page from the first page of the form
          // 1. start listening...
          const unlisten = history.listen(() => {
            if (history.action === 'POP') {
              console.log('###2 POP ', pathname);
              // 3. unlisten
              unlisten();
              // 4. push the path the user is going to
              history.push(pathname, state);
            }
          });
          console.log('###1 history.back');
          // 2. go back to the previous page of the current page
          history.back();
        }
      }
    };
  }, []);

  return { persistedData: formData, historyCancel };
}

const isValueValid = (value) => value !== null && value !== '' && value !== undefined;
