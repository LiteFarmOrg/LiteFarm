import { useEffect } from 'react';
import history from '../../history';
//TODO: toDeprecate
export default function ScrollToTop() {
  const pathname = history.location.pathname;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
