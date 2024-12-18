/*
 *  Copyright 2024 LiteFarm.org
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

import PureTaskAnimalInventory from '../../../components/Task/TaskAnimalInventory';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import { useIsTaskType } from '../useIsTaskType';
import { getProgress } from '../util';
import { useLocation, useNavigate } from 'react-router';

function TaskAnimalInventory() {
  let navigate = useNavigate();
  let location = useLocation();
  const isCustomTask = useIsTaskType('CUSTOM_TASK');
  const progress = isCustomTask ? getProgress('CUSTOM_TASK', 'task_animal_selection') : undefined;

  const onGoBack = () => {
    navigate(-1);
  };

  const onContinue = () => {
    isCustomTask
      ? navigate('/add_task/task_details', { state: location?.state })
      : navigate('/add_task/task_locations', { state: location?.state });
  };

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <HookFormPersistProvider>
      <PureTaskAnimalInventory
        onGoBack={onGoBack}
        onContinue={onContinue}
        isDesktop={isDesktop}
        isRequired={!isCustomTask}
        progress={progress}
      />
    </HookFormPersistProvider>
  );
}

export default TaskAnimalInventory;
