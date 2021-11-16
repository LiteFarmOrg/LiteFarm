import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userFarmsByFarmSelector, userFarmSelector } from '../../userFarmSlice';
import PureStepOne from '../../../components/Shift/StepOne';
import { getAllUserFarmsByFarmId } from '../../Profile/People/saga';
import history from '../../../history';
import { resetStepOne, stepOneData, stepOneSelector } from '../../shiftSlice';
import { taskTypeSelector } from '../MyShift/selectors';
import { addTaskType } from '../actions';
import { useTranslation } from 'react-i18next';
import { enqueueErrorSnackbar } from '../../Snackbar/snackbarSlice';

function StepOne() {
  const { t } = useTranslation(['translation', 'message']);
  const dispatch = useDispatch();
  const users = useSelector(userFarmsByFarmSelector);
  const loggedUser = useSelector(userFarmSelector);
  const farm = useSelector(userFarmSelector);
  const taskTypes = useSelector(taskTypeSelector);
  const defaultData = useSelector(stepOneSelector);

  useEffect(() => {
    dispatch(getAllUserFarmsByFarmId());
  }, []);

  const onNext = (data) => {
    dispatch(stepOneData(data));
    history.push('/shift_step_two');
  };

  const onBack = () => {
    dispatch(resetStepOne());
    history.push('/shift');
  };

  const dispatchAddTaskType = (taskName) => dispatch(addTaskType(taskName));

  const showTaskRequiredError = () =>
    dispatch(enqueueErrorSnackbar(t('message:SHIFT.ERROR.REQUIRED_TASK')));

  return (
    <PureStepOne
      defaultWorker={{ value: loggedUser.user_id, label: loggedUser.first_name }}
      workers={users}
      defaultData={defaultData}
      onNext={onNext}
      onGoBack={onBack}
      farm={farm}
      taskTypes={taskTypes}
      addTaskType={dispatchAddTaskType}
      showTaskRequiredError={showTaskRequiredError}
    />
  );
}

export default StepOne;
