import { useRef } from 'react';

export function useDebounce() {
  const timeoutRef = useRef();
  const blockRef = useRef(false);
  return (callback, ms) => {
    if (!blockRef.current) {
      callback();
      blockRef.current = true;
      setTimeout(() => {
        blockRef.current = false;
      }, ms);
    }
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  };
}
