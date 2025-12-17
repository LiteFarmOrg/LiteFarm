import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function useScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollY && window.scrollTo(0, 0);
  }, [location.pathname]);
}
