import React, { useEffect, useState } from 'react';
import PureTaskAssignment from '../../../components/AddTask/PureTaskAssignment';
import { loginSelector, userFarmEntitiesSelector, userFarmSelector } from '../../userFarmSlice';
import { useDispatch, useSelector } from 'react-redux';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';
import { getCurrencyFromStore } from '../../../util/getFromReduxStore';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskTypeById } from '../../taskTypeSlice';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { createTask, createHarvestTasks } from '../../Task/saga';
import { getObjectInnerValues } from '../../../util';
import { cloneObject } from '../../../util';

function TaskManagement({ history, match }) {
  const userFarms = useSelector(userFarmEntitiesSelector);
  const { farm_id } = useSelector(loginSelector);
  const userFarm = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const users = userFarms[farm_id];
  const userData = Object.values(users);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const selectedTaskType = useSelector(taskTypeById(persistedFormData.type));
  const [options, setOptions] = useState([{ label: 'Unassigned', value: null }]);
  const [wageData, setWageData] = useState([
    { 0: { currency: null, hourly_wage: null, currencySymbol: null } },
  ]);
  const [isFarmWorker] = useState(userFarm.role_id === 3);
  const currencySymbol = grabCurrencySymbol(getCurrencyFromStore());
  const worker = users[userFarm.user_id];
  const goBackPath = '/add_task/task_details';
  const persistPaths = [goBackPath];

  useEffect(() => {
    let wage_data = [];
    let innerOptions = [];
    if (userFarm.role_id === 3) {
      let obj = { label: worker.first_name + ' ' + worker.last_name, value: worker.user_id };
      let wageObj = {
        [worker.user_id]: {
          currency: worker.units.currency,
          hourly_wage: worker.wage.amount,
          currencySymbol: currencySymbol,
        },
      };
      innerOptions.push(obj);
      wage_data.push(wageObj);
    } else {
      for (let i = 0; i < userData.length; i++) {
        let obj = {
          label: userData[i].first_name + ' ' + userData[i].last_name,
          value: userData[i].user_id,
        };
        innerOptions.push(obj);
        let wageObj = {
          [userData[i].user_id]: {
            currency: userData[i].units.currency,
            hourly_wage: userData[i].wage.amount,
            currencySymbol: currencySymbol,
          },
        };
        wage_data.push(wageObj);
      }
    }
    setOptions(options.concat(innerOptions));
    setWageData(wageData.concat(wage_data));
  }, []);

  const getHarvestTasksData = (taskData) => {
    let harvestTasks = [];
    for (let harvest_task of taskData.harvest_tasks) {
      let id = harvest_task.id.split('.');
      let location = id[0];
      let managementPlan = id[1];
      let h = {};
      h.location_id = location;
      h.management_plan_id = Number(managementPlan);
      h.harvest_everything = harvest_task.harvest_everything;
      h.quantity = harvest_task.quantity === undefined ? 0 : harvest_task.quantity;
      h.harvest_task_notes = harvest_task.harvest_task_notes === undefined ? '' : harvest_task.harvest_task_notes;
      harvestTasks.push(h);
    }
    return harvest_tasks;
  };

  const onSubmit = (data) => {
    if (selectedTaskType.task_translation_key === 'HARVESTING') {
      let harvestTasks = getHarvestTasksData(persistedFormData);
      dispatch(createHarvestTasks({ ...persistedFormData, ...data, harvest_tasks: harvestTasks}));
    } else {
      dispatch(createTask({ task_translation_key, ...filteredData }));
    }
  };

  const handleGoBack = () => {
    history.push(persistPaths[0]);
  };
  const handleCancel = () => {
    history.push('/tasks');
  };
  const onError = () => {
    console.log('onError called');
  };

  return (
    <HookFormPersistProvider>
      <PureTaskAssignment
        onSubmit={onSubmit}
        handleGoBack={handleGoBack}
        handleCancel={handleCancel}
        onError={onError}
        userFarmOptions={options}
        wageData={wageData}
        isFarmWorker={isFarmWorker}
        currencySymbol={currencySymbol}
        persistPaths={persistPaths}
      />
    </HookFormPersistProvider>
  );
}

export default TaskManagement;
