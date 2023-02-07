import React, { useEffect, useState, useMemo } from 'react';
import PureTaskAssignment from '../../../components/Task/PureTaskAssignment';
import { loginSelector, userFarmEntitiesSelector, userFarmSelector } from '../../userFarmSlice';
import { useDispatch, useSelector } from 'react-redux';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { createTask } from '../saga';
import { useTranslation } from 'react-i18next';
import { updateUserFarmWage, setUserFarmWageDoNotAskAgain } from '../../../containers/Task/saga';
import { cloneObject } from '../../../util';
import useTaskAssignForm from '../../../components/Task/AssignTask/useTaskAssignForm';
import {
  hourlyWageActions,
  WAGE_OVERRIDE,
  OVERRIDE_HOURLY_WAGE,
  assignTaskFields,
} from '../../../components/Task/AssignTask/constants';

export default function TaskManagement({ history, match, location }) {
  const userFarms = useSelector(userFarmEntitiesSelector);
  const { farm_id } = useSelector(loginSelector);
  const { t } = useTranslation();
  const userFarm = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const users = userFarms[farm_id];
  const userData = Object.values(users).filter((user) => user.status !== 'Inactive');
  const persistedFormData = useSelector(hookFormPersistSelector);
  const [isFarmWorker] = useState(userFarm.role_id === 3);
  const worker = users[userFarm.user_id];

  const defaultAssignee = useMemo(() => {
    let { assignee } = persistedFormData;
    if (!assignee) {
      if (isFarmWorker || userData.length === 1) {
        // "current user" if he/she is a farm worker or if he/she is the only user at the farm
        assignee = {
          label: worker.first_name + ' ' + worker.last_name,
          value: worker.user_id,
        };
      } else {
        // “Unassigned” if more than one user exists
        assignee = { label: t('TASK.UNASSIGNED'), value: null };
      }
    }
    return assignee;
  }, [persistedFormData, isFarmWorker, users, worker]);

  const taskAssignForm = useTaskAssignForm({
    user: userFarm,
    users: userData,
    defaultAssignee,
    additionalFields: {
      [OVERRIDE_HOURLY_WAGE]: persistedFormData[OVERRIDE_HOURLY_WAGE] || false,
      [WAGE_OVERRIDE]: persistedFormData[WAGE_OVERRIDE] || null,
      ...cloneObject(persistedFormData),
    },
  });

  const {
    watch,
    selectedWorker,
    showHourlyWageInputs,
    setValue,
    clearErrors,
    currency,
    userFarmWage,
  } = taskAssignForm;

  const currencySymbol = grabCurrencySymbol(currency);
  const override = watch(OVERRIDE_HOURLY_WAGE);

  useEffect(() => {
    // when assignee is changed, show user farm wage as default for "wage override" input
    if (selectedWorker.label !== t('TASK.UNASSIGNED') && userFarmWage) {
      setValue(WAGE_OVERRIDE, userFarmWage);
      clearErrors(WAGE_OVERRIDE);
    }
  }, [selectedWorker, userFarmWage]);

  const onSubmit = (data) => {
    const { hourly_wage_action, assignee, hourly_wage, override_hourly_wage, wage_at_moment } =
      data;
    const override =
      (!showHourlyWageInputs && override_hourly_wage) || // user has a wage but wants to override
      (showHourlyWageInputs && hourly_wage_action === hourlyWageActions.FOR_THIS_TASK); // no user wage and set wage for this task

    const postData = {
      ...persistedFormData,
      ...{
        assignee_user_id: assignee,
        override_hourly_wage: override,
        wage_at_moment: override
          ? +(showHourlyWageInputs ? +hourly_wage.toFixed(2) : wage_at_moment)
          : null,
      },
      returnPath: location.state ? location.state.pathname : null,
    };
    Object.keys((key) => {
      if (assignTaskFields.includes[key]) {
        delete postData[key];
      }
    });
    dispatch(createTask(postData));

    // for user who does not have a wage set, take the hourly wage action
    if (showHourlyWageInputs) {
      if (hourly_wage_action === hourlyWageActions.SET_HOURLY_WAGE) {
        const wage = +hourly_wage.toFixed(2);
        dispatch(
          updateUserFarmWage({ user_id: assignee.value, wage: { type: 'hourly', amount: wage } }),
        );
      } else if (hourly_wage_action === hourlyWageActions.DO_NOT_ASK_AGAIN) {
        dispatch(setUserFarmWageDoNotAskAgain({ user_id: assignee.value }));
      }
    }
  };

  const handleGoBack = () => {
    history.back();
  };

  const onError = () => {
    console.log('onError called');
  };

  return (
    <HookFormPersistProvider>
      <PureTaskAssignment
        onSubmit={onSubmit}
        handleGoBack={handleGoBack}
        onError={onError}
        isFarmWorker={isFarmWorker}
        currencySymbol={currencySymbol}
        override={override}
        {...taskAssignForm}
      />
    </HookFormPersistProvider>
  );
}
