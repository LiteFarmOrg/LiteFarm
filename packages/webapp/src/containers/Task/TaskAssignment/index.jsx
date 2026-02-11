import { useState, useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import ModalComponent from '../../../components/Modals/ModalComponent/v2';
import Checkbox from '../../../components/Form/Checkbox';
import PureTaskAssignment from '../../../components/Task/PureTaskAssignment';
import { loginSelector, userFarmEntitiesSelector, userFarmSelector } from '../../userFarmSlice';
import { useDispatch, useSelector } from 'react-redux';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { createTask } from '../saga';
import { useTranslation } from 'react-i18next';
import { cloneObject } from '../../../util';
import useTaskAssignForm from '../../../components/Task/AssignTask/useTaskAssignForm';
import {
  HourlyWageAction,
  assignTaskFields,
  ASSIGNEE,
  ALREADY_COMPLETED,
} from '../../../components/Task/AssignTask/constants';
import { getProgress } from '../util';
import { useIsTaskType } from '../useIsTaskType';
import { useIsOffline } from '../../hooks/useOfflineDetector/useIsOffline';

export default function TaskAssignment() {
  const location = useLocation();
  const history = useHistory();
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
  const isOffline = useIsOffline();

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
      ...cloneObject(persistedFormData),
    },
  });

  const { watch, register, unregister } = taskAssignForm;

  const onSubmit = (data) => {
    const { hourly_wage_action, assignee, hourly_wage, already_completed } = data;

    const shouldSetTaskWage = hourly_wage_action === HourlyWageAction.FOR_THIS_TASK;

    const postData = {
      ...persistedFormData,
      ...{
        assignee_user_id: assignee,
        override_hourly_wage: shouldSetTaskWage,
        wage_at_moment: shouldSetTaskWage ? +hourly_wage.toFixed(2) : null,
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
  };

  const handleGoBack = () => {
    history.back();
  };

  const onError = () => {
    console.log('onError called');
  };

  const dismissModal = () => {
    setShowCannotCreateModal(false);
    history.push('/tasks');
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

  const taskCompleted = canCompleteTask && !isOffline && (
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
