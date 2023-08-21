import { useRef } from 'react';

export function useThrottle() {
  const timeoutRef = useRef();
  return (callback, ms) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(callback, ms);
  };
}
