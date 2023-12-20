import { useEffect, useState } from 'react';

function useHistoryLocation(history) {
  const [historyLocation, setHistoryLocation] = useState(history.location);

  useEffect(() => {
    let unlisten = history.listen(({ location }) => {
      setHistoryLocation(location);
    });
    return () => unlisten();
  }, [history]);

  return historyLocation;
}

export default useHistoryLocation;
