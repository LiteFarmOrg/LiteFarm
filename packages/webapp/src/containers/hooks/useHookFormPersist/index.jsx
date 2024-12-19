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
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom-v5-compat';

export default function useHookFormPersist(getValues = () => ({}), persistedPathNames = []) {
  let navigate = useNavigate();
  let navType = useNavigationType();
  let location = useLocation();
  const dispatch = useDispatch();

  const [lastElsePushActivated, setLastElsePushActivated] = useState(false);
  const [lastElsePopActivated, setLastElsePopActivated] = useState(false);

  const historyStack = useSelector(hookFormPersistHistoryStackSelector);
  useEffect(() => {
    if (!historyStack.length) {
      dispatch(pushHistoryStack(location.pathname));
    }
  }, []);

  const historyCancel = useCallback(() => {
    navigate(-historyStack.length);
  }, [historyStack]);

  const formData = useSelector(hookFormPersistSelector);
  const persistedPathsSet = useSelector(hookFormPersistedPathsSetSelector);
  useLayoutEffect(() => {
    return () => {
      if (location.state?.forceReset) {
        dispatch(resetAndUnLockFormData());
      } else if (
        persistedPathsSet.has(location.pathname) ||
        persistedPathNames.includes(location.pathname)
      ) {
        dispatch(hookFormPersistUnMount(getValues()));
        switch (navType) {
          case 'PUSH':
            dispatch(pushHistoryStack(location.pathname));
            break;
          case 'POP':
            dispatch(popHistoryStack());
            break;
          case 'REPLACE':
            dispatch(replaceHistoryStack(location.pathname));
            break;
          default:
            break;
        }
      } else {
        dispatch(resetAndUnLockFormData());
        if (navType === 'PUSH' && !lastElsePushActivated) {
          setLastElsePushActivated(true);
          navigate(-(historyStack.length || 1) - 1);
        } else if (navType === 'POP' && !lastElsePopActivated) {
          setLastElsePopActivated(true);
          navigate(-1);
        }
      }
    };
  }, []);

  // Do not add state variables to dependency array
  useLayoutEffect(() => {
    if (navType === 'POP' && lastElsePushActivated) {
      setLastElsePushActivated(false);
      navigate(location.pathname, { state: location.state });
    } else if (navType === 'POP' && lastElsePopActivated) {
      setLastElsePopActivated(false);
      navigate(location.pathname, { state: location.state });
    }
  }, [navType]);

  return { persistedData: formData, historyCancel };
}
