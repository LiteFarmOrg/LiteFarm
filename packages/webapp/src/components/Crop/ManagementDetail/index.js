import React, { useState } from 'react';
import CropHeader from '../cropHeader';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import { AddLink, Label, Underlined } from '../../Typography';
import Layout from '../../Layout';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import Card from '../../Card';
import { ReactComponent as Pencil } from '../../../assets/images/managementPlans/pencil.svg';
import IncompleteTaskModal from '../../Modals/IncompleteTaskModal';
import TaskCard from '../../../containers/Task/TaskCard';
import TaskQuickAssignModal from '../../Task/QuickAssign';

export default function PureManagementDetail({
  onCompleted,
  onAbandon,
  onBack,
  onAddTask,
  variety,
  plan,
  isAdmin,
  tasks,
  hasPendingTasks,
  history,
}) {
  const { t } = useTranslation();

  const title = plan.name;

  const notes = plan.notes;

  const [showCompleteFailModal, setShowCompleteFailModal] = useState(false);
  const [quickAssignInfo, setQuickAssignInfo] = useState(null);

  const onMarkComplete = () => {
    if (hasPendingTasks) {
      setShowCompleteFailModal(true);
    } else {
      onCompleted();
    }
  };

  const handleClickAssignee = (taskId, dueDate, isAssigned) => {
    setQuickAssignInfo({ taskId, dueDate, isAssigned });
  };

  return (
    <Layout
      buttonGroup={
        isAdmin && (
          <>
            <Button fullLength onClick={onMarkComplete}>
              {t('common:MARK_COMPLETED')}
            </Button>
          </>
        )
      }
    >
      <CropHeader
        onBackClick={onBack}
        crop_translation_key={variety.crop_translation_key}
        crop_variety_name={variety.crop_variety_name}
        crop_variety_photo_url={variety.crop_variety_photo_url}
        supplierName={variety.supplier}
      />

      <div className={styles.titlewrapper}>
        <Label className={styles.title} style={{ marginTop: '24px' }}>
          {title}
        </Label>
        {isAdmin && (
          <div>
            <Pencil className={styles.pencil} style={{ marginRight: '5px' }} />
            <Underlined
              onClick={() => {
                console.log('Go to edit page');
              }}
            >
              {t('MANAGEMENT_DETAIL.EDIT_PLAN')}
            </Underlined>
          </div>
        )}
      </div>

      {notes.length > 0 && (
        <>
          <Label style={{ marginTop: '24px' }}>{t('MANAGEMENT_DETAIL.PLAN_NOTES')}</Label>
          <Card className={styles.notes} color={'info'} style={{ marginTop: '4px' }}>
            <Label className={styles.notescontent} style={{ marginTop: '14px', marginLeft: '8px' }}>
              {notes}
            </Label>
          </Card>
          <Label className={styles.subtitle} style={{ marginTop: '32px' }}>
            {t('MANAGEMENT_DETAIL.ASSOCIATED_TASKS')}
          </Label>
        </>
      )}

      {isAdmin && (
        <AddLink style={{ marginTop: '16px', marginBottom: '14px' }} onClick={onAddTask}>
          {t('MANAGEMENT_DETAIL.ADD_A_TASK')}
        </AddLink>
      )}

      {tasks.map((task) => (
        <TaskCard
          task={task}
          key={task.task_id}
          onClickAssignee={handleClickAssignee}
          onClick={() => history.push(`/tasks/${task.task_id}/read_only`)}
          style={{ marginBottom: '14px' }}
        />
      ))}

      {isAdmin && (
        <div className={styles.abandonwrapper} style={{ marginTop: '24px' }}>
          <Label>{t('MANAGEMENT_DETAIL.FAILED_CROP')}</Label>
          <Underlined style={{ marginLeft: '6px' }} onClick={onAbandon}>
            {t('MANAGEMENT_DETAIL.ABANDON_PLAN')}
          </Underlined>
        </div>
      )}
      {showCompleteFailModal && (
        <IncompleteTaskModal dismissModal={() => setShowCompleteFailModal(false)} />
      )}
      {quickAssignInfo && (
        <TaskQuickAssignModal
          dismissModal={() => setQuickAssignInfo(null)}
          taskId={quickAssignInfo.taskId}
          dueDate={quickAssignInfo.dueDate}
          isAssigned={quickAssignInfo.isAssigned}
        />
      )}
    </Layout>
  );
}

PureManagementDetail.prototype = {
  onBack: PropTypes.func,
  onCompleted: PropTypes.func,
  plan: PropTypes.object,
  isAdmin: PropTypes.bool,
  onAbandon: PropTypes.func,
};
