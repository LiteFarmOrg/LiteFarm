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

import { useEffect, useState } from 'react';

const useIsAboveBreakpoint = (mqString) => {
  // this will get a boolean value later, but initialize with null so that
  // a wrong component will not be shown initially
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
