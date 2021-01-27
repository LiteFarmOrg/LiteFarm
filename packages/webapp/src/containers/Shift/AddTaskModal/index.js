import React, { useState } from 'react';
import PureAddTaskModal from "../../../components/Shift/AddTaskModal";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { addTaskType } from "../actions";
import { toastr } from "react-redux-toastr";

function AddTaskModal({switchShowModal, showModal}) {
  const { t } = useTranslation();
  const [taskName, setTaskName] = useState('');
  const dispatch = useDispatch();

  const addCustomTask = () => {
    if (taskName !== '') {
      dispatch(addTaskType(taskName));
      switchShowModal(false);
    } else toastr.error(t('message:SHIFT.ERROR.REQUIRED_TASK'));
  };

  const customTaskName = (event) => {
    const value = event.target.value;
    setTaskName(value);
  };
  return (
    <PureAddTaskModal switchShowModal={switchShowModal} showModal={showModal}
                      addCustomTask={addCustomTask} customTaskName={customTaskName} />
  )
}

export default AddTaskModal;