import React, { useEffect, useState } from 'react';
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
  return hookFormPersistUnMountResolved ? (
    React.cloneElement(children, { persistedFormData, useHookFormPersist })
  ) : (
    <Spinner />
  );
}
