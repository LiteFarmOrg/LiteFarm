import React, { useEffect, useState } from 'react';
import moment from 'moment';
import clsx from 'clsx';
import Button from '../../Form/Button';
import { useTranslation } from 'react-i18next';
import TitleLayout from '../../Layout/TitleLayout';
import DateContainer from '../../Inputs/DateContainer';
import ReactSelect from '../../Form/ReactSelect';
import styles from './styles.module.scss';
import BedImg from '../../../assets/images/log/bed.svg';
import DeliveryImg from '../../../assets/images/log/delivery.svg';
import FertImg from '../../../assets/images/log/fertilizing.svg';
import HarvestImg from '../../../assets/images/log/harvest.png';
import PestImg from '../../../assets/images/log/bug.svg';
import SaleImg from '../../../assets/images/log/sale.svg';
import ScoutImg from '../../../assets/images/log/scout.svg';
import SeedImg from '../../../assets/images/log/seeding.svg';
import SocialImg from '../../../assets/images/log/social.svg';
import WashImg from '../../../assets/images/log/wash.svg';
import WeedImg from '../../../assets/images/log/weed.svg';
import BreakImg from '../../../assets/images/log/break.svg';
import OtherImg from '../../../assets/images/log/other.svg';
import { Semibold, Text } from '../../Typography';
import AddTaskModal from '../../../components/Shift/AddTaskModal';

function PureStepOne({
  onGoBack,
  onNext,
  workers,
  defaultWorker,
  farm,
  taskTypes,
  defaultData,
  addTaskType,
  showTaskRequiredError,
}) {
  const { t } = useTranslation(['translation', 'common', 'task']);
  let workerOptions = workers.map(({ first_name, last_name, user_id }) => ({
    label: `${first_name} ${last_name}`,
    value: user_id,
  }));
  const [date, setDate] = useState(moment());
  const [selectedTasks, setSelectedTask] = useState([]);
  const [showAddModal, switchShowModal] = useState(false);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    const shrinkSelectedTasks = defaultData.selectedTasks.map(({ task_id }) => task_id);
    const currentUser = workers.find(({ user_id }) => {
      return defaultData.worker ? defaultData.worker.user_id === user_id : farm.user_id === user_id;
    });
    setDate(moment(defaultData.shift_date));
    setSelectedTask(shrinkSelectedTasks);
    setWorker(
      defaultData.worker
        ? {
            value: defaultData.worker?.user_id,
            label: `${defaultData.worker.first_name} ${defaultData.worker.last_name}`,
          }
        : {
            value: currentUser.user_id,
            label: `${currentUser.first_name} ${currentUser.last_name}`,
          },
    );
  }, []);

  const finishStepOne = () => {
    const selectedWorker = workers.find(({ user_id }) => user_id === worker.value);
    const extendedSelectedTasks = taskTypes.filter(({ task_id }) =>
      selectedTasks.includes(task_id),
    );
    onNext({ worker: selectedWorker, selectedTasks: extendedSelectedTasks, shift_date: date });
  };

  return (
    <TitleLayout
      buttonGroup={
        <>
          <Button
            type={'submit'}
            disabled={!selectedTasks.length || !worker}
            fullLength
            onClick={finishStepOne}
          >
            {t('common:NEXT')}
          </Button>
        </>
      }
      onGoBack={onGoBack}
      onCancel={onGoBack}
      title={t('SHIFT.NEW_SHIFT.STEP_ONE')}
    >
      <DateContainer
        date={date}
        onDateChange={setDate}
        placeholder={t('SHIFT.EDIT_SHIFT.CHOOSE_DATE')}
      />
      <div style={{ marginTop: '24px' }} />
      {Number(farm.role_id) === 3 && (
        <Semibold>{`${t('SHIFT.EDIT_SHIFT.WORKER')}: ${workerOptions[0].label}`}</Semibold>
      )}
      {[1, 2, 5].includes(Number(farm.role_id)) && (
        <ReactSelect
          label={t('SHIFT.EDIT_SHIFT.CHOOSE_WORKERS')}
          options={workerOptions}
          onChange={setWorker}
          value={worker}
          style={{ marginBottom: '24px' }}
          defaultValue={defaultWorker}
        />
      )}
      <Semibold>{t('SHIFT.EDIT_SHIFT.WHAT_TASKS_YOU_DID')}</Semibold>
      <TaskTypeMatrix
        t={t}
        selected={selectedTasks}
        setTasks={setSelectedTask}
        taskTypes={taskTypes}
      />
      {[1, 2, 5].includes(Number(farm.role_id)) && (
        <div className={styles.buttonContainer} style={{ paddingBottom: '24px' }}>
          <Button
            style={{ backgroundColor: 'var(--teal700)', color: 'white' }}
            onClick={() => switchShowModal(true)}
          >
            {t('SHIFT.EDIT_SHIFT.ADD_CUSTOM_TASK')}
          </Button>
        </div>
      )}
      <AddTaskModal
        showModal={showAddModal}
        switchShowModal={switchShowModal}
        addTaskType={addTaskType}
        showTaskRequiredError={showTaskRequiredError}
      />
    </TitleLayout>
  );
}

function TaskTypeMatrix({ selected, taskTypes, setTasks }) {
  const { t } = useTranslation(['translation', 'common', 'task']);
  const imgDict = {
    'Bed Preparation': BedImg,
    Delivery: DeliveryImg,
    Fertilizing: FertImg,
    Harvesting: HarvestImg,
    'Pest Control': PestImg,
    Sales: SaleImg,
    Scouting: ScoutImg,
    Seeding: SeedImg,
    'Social Event': SocialImg,
    'Wash and Pack': WashImg,
    Weeding: WeedImg,
    Break: BreakImg,
    Other: OtherImg,
  };

  const selectOrDeselectTask = (taskId) => {
    const tasks = selected.includes(taskId)
      ? selected.filter((id) => taskId !== id)
      : selected.concat(taskId);
    setTasks(tasks);
  };

  return (
    <div className={styles.matrixContainer}>
      {taskTypes.map((type, i) => {
        const taskName = t(`task:${type.task_translation_key}`);
        const buttonImg = imgDict[type.task_name] ? imgDict[type.task_name] : OtherImg;
        return (
          <div
            className={styles.matrixItem}
            onClick={() => selectOrDeselectTask(type.task_id)}
            key={`task${i}`}
          >
            <div
              className={clsx(
                styles.circleButton,
                selected.includes(type.task_id) && styles.circleSelected,
              )}
              id={type.task_id}
            >
              <img data-test="task_type" src={buttonImg} alt="" />
            </div>
            <div className={styles.buttonName}>
              <Text>{taskName}</Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PureStepOne;
