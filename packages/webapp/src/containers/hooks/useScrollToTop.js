import { useEffect } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

export default function useScrollToTop() {
  let location = useLocation();
  useEffect(() => {
    window.scrollY && window.scrollTo(0, 0);
  }, [location.pathname]);
}
