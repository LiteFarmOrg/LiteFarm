import { useEffect, useRef } from 'react';

export function usePropRef(prop) {
  const propRef = useRef();
  useEffect(() => {
    propRef.current = prop;
  }, [prop]);
  return propRef;
}
