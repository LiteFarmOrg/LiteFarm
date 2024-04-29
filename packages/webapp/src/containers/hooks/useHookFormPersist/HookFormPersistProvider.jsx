import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from './hookFormPersistSlice';
import Spinner from '../../../components/Spinner';
import useHookFormPersist from './index';

export function HookFormPersistProvider({ children }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const [hookFormPersistUnMountResolved, setHookFormPersistUnMountResolved] = useState();

  useEffect(() => {
    setHookFormPersistUnMountResolved(true);
  }, []);
  const childrenMemo = useMemo(
    () =>
      React.cloneElement(children, {
        persistedFormData,
        useHookFormPersist,
      }),
    [children, persistedFormData, useHookFormPersist],
  );
  return hookFormPersistUnMountResolved ? childrenMemo : <Spinner />;
}
