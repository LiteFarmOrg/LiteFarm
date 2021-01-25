import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userFarmsByFarmSelector, userFarmSelector } from "../../userFarmSlice";
import { useTranslation } from "react-i18next";
import PureStepOne from "../../../components/Shift/StepOne";
import { getAllUserFarmsByFarmId } from "../../Profile/People/saga";
import history from "../../../history";
import { stepOneData } from "../../shiftSlice";

function StepOne() {
  const dispatch = useDispatch();
  const users = useSelector(userFarmsByFarmSelector);
  const loggedUser = useSelector(userFarmSelector);

  useEffect(() => {
    dispatch(getAllUserFarmsByFarmId())
  }, []);

  const onNext = (data) => {
    dispatch(stepOneData(data))
    history.push('/shift_step_two')
  }

  return (
    <PureStepOne defaultWorker={{ value: loggedUser.user_id, label: loggedUser.first_name }} workers={users} onNext={onNext} onGoBack={() => history.push('/shift')} />
  )
}

export default StepOne;