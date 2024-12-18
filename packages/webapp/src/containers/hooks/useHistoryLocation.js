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
import { useLocation } from 'react-router-dom';

function useHistoryLocation() {
  let location = useLocation();
  const [historyLocation, setHistoryLocation] = useState(location);

  // Set up a listener to update the historyLocation state synchronously
  // after DOM mutations, ensuring immediate processing of history events.
  useLayoutEffect(() => {
    setHistoryLocation(location);
  }, [location]);

  return historyLocation;
}

export default useHistoryLocation;
