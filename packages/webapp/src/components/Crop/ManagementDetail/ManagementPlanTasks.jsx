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

  const title = plan.name;

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
