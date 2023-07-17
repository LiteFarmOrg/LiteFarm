import React, { useState } from 'react';
import CropHeader from '../CropHeader';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import { AddLink, Label, Underlined } from '../../Typography';
import Layout from '../../Layout';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import IncompleteTaskModal from '../../Modals/IncompleteTaskModal';
import RouterTab from '../../RouterTab';
import { managementPlansByCropVarietyIdSelector } from '../../../containers/managementPlanSlice.js';
import { taskCardContentByManagementPlanSelector } from '../../../containers/Task/taskCardContentSelector';

import { useSelector, useDispatch } from 'react-redux';
import { setPersistedPaths } from '../../../containers/hooks/useHookFormPersist/hookFormPersistSlice';

export default function PureManagementTasks({
  onCompleted,
  onAbandon,
  onBack,
  onAddTask,
  variety,
  plan,
  isAdmin,
  hasPendingTasks,
  history,
  match,
  children,
  location,
}) {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const title = plan.name;

  const farmManagementPlansForCropVariety = useSelector(
    managementPlansByCropVarietyIdSelector(plan.crop_variety_id),
  );

  const taskCardContents = useSelector(
    taskCardContentByManagementPlanSelector(plan.management_plan_id),
  );

  const onRepeatPlan = (crop_id, plan_id) => {
    dispatch(
      setPersistedPaths([
        `/crop/${crop_id}/management_plan/${plan_id}/details`,
        `/crop/${crop_id}/management_plan/${plan_id}/repeat`,
      ]),
    );
    history.push(`/crop/${crop_id}/management_plan/${plan_id}/repeat`, { fromCreation: false });
  };

  const [showCompleteFailModal, setShowCompleteFailModal] = useState(false);

  const onMarkComplete = () => {
    if (hasPendingTasks) {
      setShowCompleteFailModal(true);
    } else {
      onCompleted();
    }
  };

  const isActiveOrPlanned = !plan.abandon_date && !plan.complete_date;

  return (
    <Layout
      buttonGroup={
        isAdmin &&
        isActiveOrPlanned && (
          <>
            <Button fullLength onClick={onMarkComplete}>
              {t('common:MARK_COMPLETED')}
            </Button>
          </>
        )
      }
    >
      <CropHeader onBackClick={() => history.go(-1)} variety={variety} />

      <div className={styles.titlewrapper}>
        <Label className={styles.title} style={{ marginTop: '24px' }}>
          {title}
        </Label>
      </div>

      <RouterTab
        classes={{ container: { margin: '24px 0 26px 0' } }}
        history={history}
        tabs={[
          {
            label: t('MANAGEMENT_DETAIL.TASKS'),
            path: `/crop/${match.params.variety_id}/management_plan/${match.params.management_plan_id}/tasks`,
            state: location?.state,
          },
          {
            label: t('MANAGEMENT_DETAIL.DETAILS'),
            path: `/crop/${match.params.variety_id}/management_plan/${match.params.management_plan_id}/details`,
            state: location?.state,
          },
        ]}
      />

      <Button
        style={{ marginBlock: '20px' }}
        onClick={() => onRepeatPlan(plan.crop_variety_id, plan.management_plan_id)}
      >
        Repeat Crop Plan
      </Button>

      {isAdmin && isActiveOrPlanned && (
        <AddLink style={{ marginTop: '16px', marginBottom: '14px' }} onClick={onAddTask}>
          {t('MANAGEMENT_DETAIL.ADD_A_TASK')}
        </AddLink>
      )}
      {children}

      {isAdmin && isActiveOrPlanned && (
        <div className={styles.abandonwrapper} style={{ marginTop: '24px', marginBottom: '26px' }}>
          <Label>{t('MANAGEMENT_DETAIL.FAILED_CROP')}</Label>
          <Underlined style={{ marginLeft: '6px' }} onClick={onAbandon}>
            {t('MANAGEMENT_DETAIL.ABANDON_PLAN')}
          </Underlined>
        </div>
      )}
      {showCompleteFailModal && (
        <IncompleteTaskModal dismissModal={() => setShowCompleteFailModal(false)} />
      )}
    </Layout>
  );
}

PureManagementTasks.prototype = {
  onBack: PropTypes.func,
  onCompleted: PropTypes.func,
  plan: PropTypes.object,
  isAdmin: PropTypes.bool,
  onAbandon: PropTypes.func,
};
