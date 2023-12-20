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

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ReleaseBadge from '../../components/ReleaseBadge';
import { checkReleaseBadgeVersion } from './saga';
import { APP_VERSION } from '../../util/constants';

const ReleaseHandler = () => {
  const dispatch = useDispatch();

  const [shouldShowBadge, setShouldShowBadge] = useState(false);

  useEffect(() => {
    dispatch(checkReleaseBadgeVersion({ currentVersion: APP_VERSION, setShouldShowBadge }));
  }, []);

  return shouldShowBadge && <ReleaseBadge APP_VERSION={APP_VERSION} />;
};

export default ReleaseHandler;
