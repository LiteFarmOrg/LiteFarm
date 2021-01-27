import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userFarmsByFarmSelector, userFarmSelector } from "../../userFarmSlice";
import PureStepOne from "../../../components/Shift/StepOne";
import { getAllUserFarmsByFarmId } from "../../Profile/People/saga";
import history from "../../../history";
import { stepOneData, stepOneSelector } from "../../shiftSlice";
import { taskTypeSelector } from "../MyShift/selectors";

function StepOne() {
  const dispatch = useDispatch();
  const users = useSelector(userFarmsByFarmSelector);
  const loggedUser = useSelector(userFarmSelector);
  const farm = useSelector(userFarmSelector);
  const taskTypes = useSelector(taskTypeSelector);
  const defaultData = useSelector(stepOneSelector);

  useEffect(() => {
    dispatch(getAllUserFarmsByFarmId())
  }, []);

  const onNext = (data) => {
    dispatch(stepOneData(data))
    history.push('/shift_step_two')
  }

  return (
    <PureStepOne defaultWorker={{ value: loggedUser.user_id, label: loggedUser.first_name }} workers={users} defaultData={defaultData}
                 onNext={onNext} onGoBack={() => history.push('/shift')} farm={farm} taskTypes={taskTypes} />
  )
}

export default StepOne;