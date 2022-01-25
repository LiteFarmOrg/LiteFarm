import { useEffect, useState } from 'react';

export function PersistedFormWrapper({ children }) {
  const [hookFormPersistUnMountResolved, setHookFormPersistUnMountResolved] = useState();
  useEffect(() => setHookFormPersistUnMountResolved(true), []);
  return <>{hookFormPersistUnMountResolved && children}</>;
}
