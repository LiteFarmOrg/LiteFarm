import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Happiness, Task, TaskStatus, TaskType } from '../../../../../domain/tasks';
import { User, UserInFarm, UserInFarmWithIsAdmin, Wage } from '../../../../../domain/users';
import { PureTaskCard } from '../../../components/CardWithStatus/TaskCard/TaskCard';
// @ts-ignore until migrated to TypeScript
import TaskQuickAssignModal from '../../../components/Modals/QuickAssignModal';
// @ts-ignore until migrated to TypeScript
import UpdateTaskDateModal from '../../../components/Modals/UpdateTaskDateModal';
// @ts-ignore until migrated to TypeScript
import { userFarmsByFarmSelector, userFarmSelector } from '../../userFarmSlice';
import {
  assignTask,
  assignTasksOnDate,
  changeTaskDate,
  changeTaskWage,
  pinTask,
  setUserFarmWageDoNotAskAgain,
  unpinTask,
  updateUserFarmWage,
  // @ts-ignore until migrated to TypeScript
} from '../saga';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';

interface Props {
  style: React.CSSProperties;
  status: TaskStatus;
  pinned: boolean;
  classes: { container?: {}; card: {} };
  onClick?: (() => void) | null;
  happiness: Happiness;
  locationName: string;
  taskType: TaskType;
  cropVarietyName: string;
  completeOrDueDate: string;
  abandon_date: string;
  assignee?: User | null;
  onClickAssignee: () => void;
  onClickCompleteOrDueDate: () => void;
  selected: boolean;
  task_id: number;
  wage_at_moment: unknown;
}

const TaskCard = ({
  task_id,
  taskType,
  status,
  pinned,
  locationName,
  cropVarietyName,
  completeOrDueDate,
  assignee = null,
  style,
  onClick = null,
  selected,
  happiness,
  classes = { card: {} },
  wage_at_moment,
  ...props
}: Props) => {
  const [showTaskAssignModal, setShowTaskAssignModal] = React.useState<boolean>();
  const [showDateAssignModal, setShowDateAssignModal] = React.useState<boolean>();
  const dispatch = useDispatch();
  const onChangeTaskDate = (date: string) => {
    dispatch(changeTaskDate({ task_id, due_date: date + 'T00:00:00.000' }));
  };
  const onAssignTasksOnDate = (task: Task) => dispatch(assignTasksOnDate(task));
  const onAssignTask = (task: Task) => dispatch(assignTask(task));
  const onPinTask = () => dispatch(pinTask({ task_id }));
  const onUnpinTask = () => dispatch(unpinTask({ task_id }));
  const onUpdateUserFarmWage = (user: UserInFarm) => dispatch(updateUserFarmWage(user));
  const onSetUserFarmWageDoNotAskAgain = (user: UserInFarm) => {
    dispatch(setUserFarmWageDoNotAskAgain(user));
  };
  const onChangeTaskWage = (wage: Wage) => {
    dispatch(changeTaskWage({ task_id, wage_at_moment: wage }));
  };
  // @ts-ignore until userSlice is migrated to TypeScript
  const users: UserInFarmWithIsAdmin[] = useSelector(userFarmsByFarmSelector).filter(
    (user: UserInFarmWithIsAdmin) => user.status !== 'Inactive',
  );
  const user: UserInFarmWithIsAdmin = useSelector(userFarmSelector);

  const immutableStatus = ['completed', 'abandoned'];
  let isAssignee = false;
  let isAdmin = false;
  let taskUnassigned = false;
  const language = getLanguageFromLocalStorage();

  if (user) {
    isAdmin = user.is_admin;
  }
  if (assignee) {
    isAssignee = user.user_id === assignee.user_id;
  } else {
    taskUnassigned = true;
  }

  return (
    <>
      <PureTaskCard
        taskType={taskType}
        status={status}
        pinned={pinned}
        locationName={locationName}
        cropVarietyName={cropVarietyName}
        completeOrDueDate={completeOrDueDate}
        abandonDate={props['abandon_date']}
        assignee={assignee}
        style={style}
        onClick={onClick}
        onClickAssignee={() => {
          if (!immutableStatus.includes(status) && (isAssignee || isAdmin || taskUnassigned)) {
            setShowTaskAssignModal(true);
          }
        }}
        onClickCompleteOrDueDate={() => {
          if (!immutableStatus.includes(status) && isAdmin) {
            setShowDateAssignModal(true);
          }
        }}
        onPin={onPinTask}
        onUnpin={onUnpinTask}
        selected={selected}
        happiness={happiness}
        classes={classes}
        isAdmin={isAdmin}
        isAssignee={isAssignee}
        language={language}
      />
      {showTaskAssignModal && (
        <TaskQuickAssignModal
          task_id={task_id}
          due_date={completeOrDueDate}
          isAssigned={!!assignee}
          onAssignTasksOnDate={onAssignTasksOnDate}
          onAssignTask={onAssignTask}
          onUpdateUserFarmWage={onUpdateUserFarmWage}
          onChangeTaskWage={onChangeTaskWage}
          onSetUserFarmWageDoNotAskAgain={onSetUserFarmWageDoNotAskAgain}
          users={users}
          user={user}
          dismissModal={() => setShowTaskAssignModal(false)}
          wage_at_moment={wage_at_moment}
        />
      )}
      {showDateAssignModal && (
        <UpdateTaskDateModal
          due_date={completeOrDueDate}
          onChangeTaskDate={onChangeTaskDate}
          dismissModal={() => setShowDateAssignModal(false)}
        />
      )}
    </>
  );
};

export default TaskCard;
