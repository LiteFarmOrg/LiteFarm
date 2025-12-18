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
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { irrigationTypeByKeyAndFarmIdSelector } from '../irrigationTaskTypesSlice';
import { taskTypeByKeySelector } from '../taskTypeSlice';
import { irrigationTaskEntitiesSelector } from '../slice/taskSlice/irrigationTaskSlice';
import { setFormData, setPersistedPaths } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { getIrrigationTaskTypes } from '../Task/IrrigationTaskTypes/saga';
import { generateIrrigationTypeOption } from '../../components/Task/PureIrrigationTask';
import { ADD_TASK_ASSIGNMENT, ADD_TASK_DETAILS } from '../../util/siteMapConstants';
import { getDateInputFormat } from '../../util/moment';
import { getLocalDateInYYYYDDMM } from '../../util/date';
import { convert } from '../../util/convert-units/convert';
import type { IrrigationPrescriptionDetails } from '../../store/api/types';

export default function useApproveIrrigationPrescription(
  prescriptionDetails?: IrrigationPrescriptionDetails,
) {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getIrrigationTaskTypes());
  }, []);

  const irrigationTaskType = useSelector(taskTypeByKeySelector('IRRIGATION_TASK'));
  const pivotType = useSelector(irrigationTypeByKeyAndFarmIdSelector('PIVOT'));
  const irrigationTasks = useSelector(irrigationTaskEntitiesSelector) || [];

  if (!prescriptionDetails) {
    return undefined;
  }

  const {
    id,
    location_id,
    management_plan_id,
    recommended_start_date,
    estimated_water_consumption,
    estimated_water_consumption_unit,
  } = prescriptionDetails;

  const hasTask = Object.values(irrigationTasks).some(
    (task) => task.irrigation_prescription_external_id === id,
  );

  const onApproveIrrigationPrescription = () => {
    dispatch(setPersistedPaths([ADD_TASK_DETAILS, ADD_TASK_ASSIGNMENT]));

    const estimatedWaterUsageInL = convert(estimated_water_consumption)
      .from(estimated_water_consumption_unit)
      .to('l');

    const taskData = {
      task_type_id: irrigationTaskType?.task_type_id,
      due_date: recommended_start_date
        ? getDateInputFormat(recommended_start_date)
        : getLocalDateInYYYYDDMM(new Date()),
      locations: [{ location_id }],
      show_wild_crop: false,
      managementPlans: management_plan_id ? [{ management_plan_id }] : [],
      irrigation_task: {
        default_irrigation_task_type_location: false,
        default_irrigation_task_type_measurement: false,
        irrigation_type: pivotType && generateIrrigationTypeOption(pivotType, ['PIVOT'], t),
        measuring_type: 'DEPTH',
        estimated_water_usage: estimatedWaterUsageInL,
        irrigation_prescription_external_id: id,
      },
    };

    dispatch(setFormData(taskData));
    history.push(ADD_TASK_DETAILS);
  };

  return hasTask ? undefined : onApproveIrrigationPrescription;
}
