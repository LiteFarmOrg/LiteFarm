/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import { useLayoutEffect, useState } from 'react';

function useHistoryLocation(history) {
  const [historyLocation, setHistoryLocation] = useState(history.location);

  // Set up a listener to update the historyLocation state synchronously
  // after DOM mutations, ensuring immediate processing of history events.
  useLayoutEffect(() => {
    const unlisten = history.listen(({ location }) => {
      setHistoryLocation(location);
    });
    return () => unlisten();
  }, [history]);

  return historyLocation;
}

export default useHistoryLocation;
