import React, { useEffect, useState } from 'react';
import moment from 'moment';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../Form/Button';
import { useTranslation } from 'react-i18next';
import TitleLayout from '../../Layout/TitleLayout';
import DateContainer from '../../Inputs/DateContainer';
import ReactSelect from '../../Form/ReactSelect';
import { taskTypeSelector } from '../../../containers/Shift/MyShift/selectors';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import styles from './styles.scss';
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
import OtherImg from '../../../assets/images/log/other.svg';
import { Semibold, Text } from '../../Typography';
import Popup from 'reactjs-popup';
import closeButton from '../../../assets/images/grey_close_button.png';
import { addTaskType } from '../../../containers/Shift/actions';
import { toastr } from 'react-redux-toastr';
import { stepOneSelector } from '../../../containers/shiftSlice';

function PureStepOne({ onGoBack, onNext, workers, defaultWorker }) {
  const { t } = useTranslation();
  let workerOptions = workers.map(({ first_name, last_name, user_id }) => ({
    label: `${first_name} ${last_name}`,
    value: user_id,
  }));
  const [date, setDate] = useState(moment());
  const [selectedTasks, setSelectedTask] = useState([]);
  const [showAddModal, switchShowModal] = useState(false);
  const farm = useSelector(userFarmSelector);
  const taskTypes = useSelector(taskTypeSelector);
  const [worker, setWorker] = useState(null);
  const defaultData = useSelector(stepOneSelector);

  useEffect(() => {
    const shrinkSelectedTasks = selectedTasks.map(({ task_id }) => task_id);
    const currentUser = workers.find(({ user_id }) => farm.user_id === user_id);
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
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
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
      title={t('SHIFT.NEW_SHIFT.STEP_ONE')}
    >
      <DateContainer
        date={date}
        onDateChange={setDate}
        placeholder={t('SHIFT.EDIT_SHIFT.CHOOSE_DATE')}
      />
      <div style={{ marginTop: '24px' }} />
      <ReactSelect
        label={t('SHIFT.EDIT_SHIFT.CHOOSE_WORKERS')}
        options={workerOptions}
        onChange={setWorker}
        value={worker}
        style={{ marginBottom: '24px' }}
        defaultValue={defaultWorker}
      />
      <Semibold>What tasks did you do today?</Semibold>
      <TaskTypeMatrix t={t} selected={selectedTasks} setTasks={setSelectedTask} />
      {[1, 2, 5].includes(Number(farm.role_id)) && (
        <div className={styles.buttonContainer}>
          <Button color={'secondary'} onClick={() => switchShowModal(true)}>
            {t('SHIFT.EDIT_SHIFT.ADD_CUSTOM_TASK')}
          </Button>
        </div>
      )}
      <AddTaskModal showModal={showAddModal} switchShowModal={switchShowModal} />
    </TitleLayout>
  );
}

function AddTaskModal({ showModal, switchShowModal }) {
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
    <Popup
      open={showModal}
      closeOnDocumentClick
      onClose={() => switchShowModal(false)}
      contentStyle={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        padding: '0 5%',
      }}
      overlayStyle={{ zIndex: '1060', height: '100vh' }}
    >
      <div className={styles.modal}>
        <div className={styles.popupTitle}>
          <a className={styles.close} onClick={() => switchShowModal(false)}>
            <img src={closeButton} alt="" />
          </a>
          <h3>{t('SHIFT.EDIT_SHIFT.ADD_TASK')}</h3>
        </div>
        <div className={styles.customContainer}>
          <div className={styles.taskTitle}>{t('SHIFT.EDIT_SHIFT.NAME_TASK')}</div>
          <div className={styles.taskInput}>
            <input type="text" maxLength="20" onChange={customTaskName} />
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <Button onClick={addCustomTask}>{t('common:FINISH')}</Button>
        </div>
      </div>
    </Popup>
  );
}

function TaskTypeMatrix({ selected, setTasks }) {
  const taskTypes = useSelector(taskTypeSelector);
  const { t } = useTranslation();
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
          <div className={styles.matrixItem} onClick={() => selectOrDeselectTask(type.task_id)}>
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
              <Text>{type.task_name}</Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PureStepOne;
