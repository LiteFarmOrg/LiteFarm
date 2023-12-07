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

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { chooseFarmFlowSelector } from '../containers/ChooseFarm/chooseFarmFlowSlice';
import { userFarmSelector } from '../containers/userFarmSlice';
import { isAuthenticated } from '../util/jwt';

const useIsFarmSelected = () => {
  const farm = useSelector(userFarmSelector);
  const farmState = useSelector(chooseFarmFlowSelector);
  const { isInvitationFlow } = farmState;
  const isUserAuthenticated = isAuthenticated();

  const isFarmSelected = useMemo(() => {
    return (
      isUserAuthenticated &&
      farm &&
      farm.has_consent &&
      farm.step_five === true &&
      !isInvitationFlow
    );
  }, [isUserAuthenticated, farm.has_consent, farm.step_five, isInvitationFlow]);

  return isFarmSelected;
};

export default useIsFarmSelected;
