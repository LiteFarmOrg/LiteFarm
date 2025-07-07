/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import {
  isAdminSelector,
  measurementSelector,
  userFarmsByFarmSelector,
  userFarmSelector,
} from '../../userFarmSlice';
import { productsForTaskTypeSelector } from '../../productSlice';
import {
  setFormData,
  setPersistedPaths,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { harvestUseTypesSelector } from '../../harvestUseTypeSlice';
import { useReadonlyTask } from './useReadonlyTask';
import { isTaskType } from '../useIsTaskType';
import { useMaxZoom } from '../../Map/useMaxZoom';
import {
  assignTask,
  assignTasksOnDate,
  changeTaskDate,
  changeTaskWage,
  updateUserFarmWage,
  setUserFarmWageDoNotAskAgain,
  deleteTask,
} from '../saga';
import {
  generateMockPieSliceZones,
  mockUriData,
} from '../../../stories/IrrigationPrescription/mockData';
import { getCentroidOfPolygon } from '../../../util/geoUtils';

function TaskReadOnly({ history, match, location }) {
  const task_id = match.params.task_id;
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const task = useReadonlyTask(task_id);
  const selectedTaskType = task?.taskType;
  const products = useSelector(productsForTaskTypeSelector(selectedTaskType));
  const isIrrigationTaskWithExternalPrescription =
    isTaskType(selectedTaskType, 'IRRIGATION_TASK') &&
    task?.irrigation_task?.irrigation_prescription_external_id != null;

  /*--------------------------------------
  
  TODO LF-4788: Call the backend here to get the actual data for the given uuid 
  
  */
  let mockPivot;
  let commonMockData;
  let irrigationPrescription;
  if (isIrrigationTaskWithExternalPrescription) {
    mockPivot = {
      center: getCentroidOfPolygon(task.locations[0].grid_points),
      radius: 150,
    };

    commonMockData = {
      location_id: task.locations[0].location_id,
      management_plan_id: null,
      recommended_start_datetime: new Date().toISOString(),
      pivot: mockPivot,
      metadata: {
        weather_forecast: {
          temperature: 20,
          temperature_unit: 'c',
          wind_speed: 10,
          wind_speed_unit: 'km/h',
          cumulative_rainfall: 5,
          cumulative_rainfall_unit: 'mm',
          et_rate: 2,
          et_rate_unit: 'mm/24h',
          weather_icon_code: '02d',
        },
      },
      estimated_time: 2,
      estimated_time_unit: 'h',
      estimated_water_consumption: 600000,
      estimated_water_consumption_unit: 'l',
    };

    irrigationPrescription =
      Math.random() < 0.5
        ? {
            ...commonMockData,
            id: task?.irrigation_task?.irrigation_prescription_external_id,
            prescription: {
              uriData: mockUriData,
            },
          }
        : {
            ...commonMockData,
            id: task?.irrigation_task?.irrigation_prescription_external_id,
            prescription: {
              vriData: {
                zones: generateMockPieSliceZones(mockPivot),
                file_url: 'https://example.com/vri_data.vri',
              },
            },
          };
  }

  // Only fetch data if task is irrigation task with external id
  const externalIrrigationPrescription = isIrrigationTaskWithExternalPrescription
    ? irrigationPrescription
    : undefined;

  /* ------------------------------------- */

  let files = [];
  if (externalIrrigationPrescription?.prescription?.vriData?.file_url) {
    files.push({ url: externalIrrigationPrescription.prescription.vriData.file_url });
  }
  if (task.documents?.length) {
    const documentFiles = task.documents.flatMap((doc) => doc.files);
    files.push(...documentFiles);
  }

  const users = useSelector(userFarmsByFarmSelector);
  const user = useSelector(userFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  const harvestUseTypes = useSelector(harvestUseTypesSelector);

  const [isTaskTypeCustom, setIsTaskTypeCustom] = useState(false);
  const [isHarvest, setIsHarvest] = useState(undefined);
  const [wageAtMoment, setWageAtMoment] = useState(undefined);
  const [hasAnimals, setHasAnimals] = useState(false);

  useEffect(() => {
    if (task === undefined) {
      history.replace('/unknown_record');
    } else {
      setIsTaskTypeCustom(!!task.taskType.farm_id);
      setIsHarvest(isTaskType(task.taskType, 'HARVEST_TASK'));
      setWageAtMoment(task.wage_at_moment);
      setHasAnimals(task.animals?.length || task.animal_batches?.length);
    }
  }, [task, history]);

  const onGoBack = () => {
    history.back();
  };

  const onComplete = () => {
    if (isHarvest) {
      history.push(`/tasks/${task_id}/complete_harvest_quantity`, location?.state);
    } else if (isTaskTypeCustom && !hasAnimals) {
      dispatch(setFormData({ task_id, taskType: task.taskType }));
      history.push(`/tasks/${task_id}/complete`, location?.state);
    } else {
      history.push(`/tasks/${task_id}/before_complete`, location?.state);
    }
  };

  const onEdit = () => {
    // TODO - LF-1720 Edit task page
  };

  const onAbandon = () => {
    history.push(`/tasks/${task_id}/abandon`, location?.state);
  };

  const onGoToCropPlan = () => {
    const { crop_variety_id, planting_management_plan } = task.managementPlans[0];
    const path = `/crop/${crop_variety_id}/management_plan/${planting_management_plan.management_plan_id}/tasks`;

    history.push(path, location?.state);
  };

  const { maxZoomRef, getMaxZoom } = useMaxZoom();

  const onChangeTaskDate = (date) =>
    dispatch(changeTaskDate({ task_id, due_date: date + 'T00:00:00.000' }));
  const onAssignTasksOnDate = (task) => dispatch(assignTasksOnDate(task));
  const onAssignTask = (task) => dispatch(assignTask(task));
  const onUpdateUserFarmWage = (user) => dispatch(updateUserFarmWage(user));
  const onSetUserFarmWageDoNotAskAgain = (user) => {
    dispatch(setUserFarmWageDoNotAskAgain(user));
  };
  const onChangeTaskWage = (wage) => {
    dispatch(changeTaskWage({ task_id, wage_at_moment: wage }));
  };

  const onDelete = () => {
    dispatch(deleteTask({ task_id }));
  };
  return (
    <>
      {task && (
        <PureTaskReadOnly
          task_id={task_id}
          onGoBack={onGoBack}
          onComplete={onComplete}
          onEdit={onEdit}
          onAbandon={onAbandon}
          onGoToCropPlan={onGoToCropPlan}
          onDelete={onDelete}
          task={task}
          users={users}
          user={user}
          isAdmin={isAdmin}
          system={system}
          products={products}
          externalIrrigationPrescription={externalIrrigationPrescription}
          files={files}
          harvestUseTypes={harvestUseTypes}
          isTaskTypeCustom={isTaskTypeCustom}
          maxZoomRef={maxZoomRef}
          getMaxZoom={getMaxZoom}
          onAssignTasksOnDate={onAssignTasksOnDate}
          onAssignTask={onAssignTask}
          onChangeTaskDate={onChangeTaskDate}
          onChangeTaskWage={onChangeTaskWage}
          onUpdateUserFarmWage={onUpdateUserFarmWage}
          onSetUserFarmWageDoNotAskAgain={onSetUserFarmWageDoNotAskAgain}
          wage_at_moment={wageAtMoment}
        />
      )}
    </>
  );
}

export default TaskReadOnly;
