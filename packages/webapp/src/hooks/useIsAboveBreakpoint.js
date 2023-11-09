import { useEffect, useState } from 'react';

const useIsAboveBreakpoint = (mqString) => {
  // this will get a boolean value later, but initialize with null so that
  // a wrong button will not be shown initially
  const [isAboveBreakPoint, setIsAboveBreakPoint] = useState(null);

  useEffect(() => {
    const media = matchMedia(mqString);

    setIsAboveBreakPoint(media.matches);

    media.addEventListener('change', (e) => setIsAboveBreakPoint(e.matches));

    return () => {
      media.removeEventListener('change', setIsAboveBreakPoint);
    };
  }, []);

  return isAboveBreakPoint;
};

export default useIsAboveBreakpoint;
