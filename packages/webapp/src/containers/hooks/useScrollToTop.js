import { useEffect } from 'react';
import history from '../../history';

export default function useScrollToTop() {
  useEffect(() => {
    window.scrollY && window.scrollTo(0, 0);
  }, [history.location.pathname]);
}
