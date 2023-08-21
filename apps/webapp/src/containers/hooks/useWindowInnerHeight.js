import { useEffect, useState } from 'react';

export default function useWindowInnerHeight() {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  useEffect(() => {
    const handleResize = () => {
      if (windowHeight !== window.innerHeight) {
        setWindowHeight(window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return (_) => window.removeEventListener('resize', handleResize);
  });
  return windowHeight;
}
