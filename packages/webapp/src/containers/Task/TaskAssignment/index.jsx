import { useEffect, useState, useMemo } from 'react';
import ModalComponent from '../../../components/Modals/ModalComponent/v2';
import Checkbox from '../../../components/Form/Checkbox';
import PureTaskAssignment from '../../../components/Task/PureTaskAssignment';
import { loginSelector, userFarmEntitiesSelector, userFarmSelector } from '../../userFarmSlice';
import { useDispatch, useSelector } from 'react-redux';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { createTask, updateUserFarmWage, setUserFarmWageDoNotAskAgain } from '../saga';
import { useTranslation } from 'react-i18next';
import { cloneObject } from '../../../util';
import useTaskAssignForm from '../../../components/Task/AssignTask/useTaskAssignForm';
import {
  hourlyWageActions,
  WAGE_OVERRIDE,
  OVERRIDE_HOURLY_WAGE,
  assignTaskFields,
  ASSIGNEE,
  ALREADY_COMPLETED,
} from '../../../components/Task/AssignTask/constants';
import { getProgress } from '../util';
import { useIsTaskType } from '../useIsTaskType';
import { useLocation, useNavigate } from 'react-router';

export default function TaskManagement() {
  let navigate = useNavigate();
  let location = useLocation();
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
  const isCustomTask = useIsTaskType('CUSTOM_TASK');
  const progress = isCustomTask ? getProgress('CUSTOM_TASK', 'task_assignment') : undefined;
  const [showCannotCreateModal, setShowCannotCreateModal] = useState(false);

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
    register,
    unregister,
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
    const {
      hourly_wage_action,
      assignee,
      hourly_wage,
      override_hourly_wage,
      wage_at_moment,
      already_completed,
    } = data;
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
    // delete data(HOURLY_WAGE_ACTION, SELECT_ALL etc) that should not be included in API request
    delete postData[ALREADY_COMPLETED];
    Object.keys(data).forEach((key) => {
      if (assignTaskFields.includes(key)) {
        delete postData[key];
      }
    });
    dispatch(
      createTask({ ...postData, setShowCannotCreateModal, alreadyCompleted: already_completed }),
    );

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
    navigate(-1);
  };

  const onError = () => {
    console.log('onError called');
  };

  const dismissModal = () => {
    setShowCannotCreateModal(false);
    navigate('/tasks');
  };

  // Only creating user or assigned user can complete task -- see TaskReadOnly
  const assignee = watch(ASSIGNEE);
  const assignedToPseudoUser = assignee.value && users && users[assignee.value].role_id === 4;
  const canCompleteTask = !!(
    userFarm.user_id === assignee.value ||
    (assignedToPseudoUser && userFarm.is_admin)
  );
  const isAlreadyCompleted = watch(ALREADY_COMPLETED);

  // Unregister form value if registered and selected assignee changes.
  if (!canCompleteTask && isAlreadyCompleted) {
    unregister(ALREADY_COMPLETED);
  }

  const taskCompleted = canCompleteTask && (
    <>
      <Checkbox
        data-cy="task-alreadyComplete"
        label={t('ADD_TASK.THIS_TASK_IS_COMPLETED')}
        style={{ marginTop: '40px', marginBottom: '16px' }}
        hookFormRegister={register(ALREADY_COMPLETED)}
      />
      {isAlreadyCompleted && t('ADD_TASK.THIS_TASK_IS_COMPLETED_EXPLANATION')}
    </>
  );

  return (
    <>
      <HookFormPersistProvider>
        <PureTaskAssignment
          onSubmit={onSubmit}
          handleGoBack={handleGoBack}
          onError={onError}
          isFarmWorker={isFarmWorker}
          currencySymbol={currencySymbol}
          override={override}
          {...taskAssignForm}
          additionalContent={taskCompleted}
          progress={progress}
        />
      </HookFormPersistProvider>
      {showCannotCreateModal && (
        <ModalComponent
          title={t('TASK.CREATE.FAILED')}
          contents={[t('TASK.CREATE.LOCATION_DELETED')]}
          dismissModal={dismissModal}
          error
        />
      )}
    </>
  );
}
