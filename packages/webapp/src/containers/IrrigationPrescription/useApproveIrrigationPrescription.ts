/*
 *  Copyright 2025 LiteFarm.org
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
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { History } from 'history';
import { useTranslation } from 'react-i18next';
import { irrigationTypeByKeyAndFarmIdSelector } from '../irrigationTaskTypesSlice';
import { taskTypeByKeySelector } from '../taskTypeSlice';
import { irrigationTaskEntitiesSelector } from '../slice/taskSlice/irrigationTaskSlice';
import { setFormData, setPersistedPaths } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { getIrrigationTaskTypes } from '../Task/IrrigationTaskTypes/saga';
import { generateIrrigationTypeOption } from '../../components/Task/PureIrrigationTask';
import { ADD_TASK_ASSIGNMENT, ADD_TASK_DETAILS } from '../../util/siteMapConstants';
import { getLocalDateInYYYYDDMM } from '../../util/date';
import { waterUsage, convertFn } from '../../util/convert-units/unit';
import { IrrigationPrescription } from '../../components/IrrigationPrescription/types';

export default function useApproveIrrigationPrescription(
  history: History,
  {
    id,
    location_id,
    management_plan_id,
    recommended_start_datetime,
    estimated_water_consumption,
    estimated_water_consumption_unit,
  }: IrrigationPrescription,
) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getIrrigationTaskTypes());
  }, []);

  const irrigationTaskType = useSelector(taskTypeByKeySelector('IRRIGATION_TASK'));
  const pivotType = useSelector(irrigationTypeByKeyAndFarmIdSelector('PIVOT'));
  const irrigationTasks = useSelector(irrigationTaskEntitiesSelector) || [];
  const hasTask = Object.values(irrigationTasks).some(
    (task) => task.irrigation_prescription_external_id === id,
  );

  const onApproveIrrigationPrescription = () => {
    dispatch(setPersistedPaths([ADD_TASK_DETAILS, ADD_TASK_ASSIGNMENT]));

    const estimatedWaterUsageInL = convertFn(
      waterUsage,
      estimated_water_consumption,
      estimated_water_consumption_unit,
      'l',
    ); // TODO: LF-4810 Adjust conversion once estimated_water_consumption_unit is confirmed

    const taskData = {
      task_type_id: irrigationTaskType?.task_type_id,
      due_date: getLocalDateInYYYYDDMM(new Date(recommended_start_datetime)),
      locations: [{ location_id }],
      show_wild_crop: false,
      managementPlans: management_plan_id ? [{ management_plan_id }] : [],
      irrigation_task: {
        default_irrigation_task_type_location: false,
        default_irrigation_task_type_measurement: false,
        irrigation_type_name: pivotType && generateIrrigationTypeOption(pivotType, ['PIVOT'], t),
        measuring_type: 'DEPTH',
        estimated_water_usage: estimatedWaterUsageInL,
        irrigation_type_id: pivotType?.irrigation_type_id,
        irrigation_prescription_external_id: id,
      },
    };

    dispatch(setFormData(taskData));
    history.push(ADD_TASK_DETAILS);
  };

  return hasTask ? undefined : onApproveIrrigationPrescription;
}
