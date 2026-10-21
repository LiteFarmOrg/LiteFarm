/*
 *  Copyright 2026 LiteFarm.org
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

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  loginSelector,
  userFarmLengthSelector,
  userFarmStatusSelector,
} from '../containers/userFarmSlice';
import { getUserFarms } from '../containers/ChooseFarm/saga';

export default function useFarmListRecovery() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasUserFarm = useSelector(userFarmLengthSelector);
  const { loaded, loading } = useSelector(userFarmStatusSelector);
  const { farm_id } = useSelector(loginSelector);
  const wasFarmlessOnMount = useRef(!hasUserFarm);

  useEffect(() => {
    if (!hasUserFarm && !loading) {
      dispatch(getUserFarms());
    }
  }, []);

  useEffect(() => {
    if (wasFarmlessOnMount.current && loaded && hasUserFarm && !farm_id) {
      navigate('/farm_selection');
    }
  }, [loaded, hasUserFarm, farm_id]);
}
