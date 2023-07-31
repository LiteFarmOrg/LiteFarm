import React, { useState } from 'react';
import CropHeader from '../CropHeader';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import { AddLink, Label, IconLink, Main } from '../../Typography';
import Layout from '../../Layout';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import IncompleteTaskModal from '../../Modals/IncompleteTaskModal';
import RouterTab from '../../RouterTab';
import { useDispatch } from 'react-redux';
import { setPersistedPaths } from '../../../containers/hooks/useHookFormPersist/hookFormPersistSlice';
import DeleteBox from '../../Task/TaskReadOnly/DeleteBox';
import { FiAlertTriangle } from 'react-icons/fi';
import { ReactComponent as TrashIcon } from '../../../assets/images/document/trash.svg';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { ClickAwayListener } from '@mui/material';

export default function PureManagementTasks({
  onCompleted,
  onAbandon,
  onBack,
  onDelete = () => {},
  onAddTask,
  variety,
  plan,
  isAdmin,
  hasPendingTasks,
  history,
  match,
  children,
  location,
  eligibleForDeletion,
}) {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const title = plan?.name;

  const onRepeatPlan = (crop_id, plan_id) => {
    dispatch(
      setPersistedPaths([
        `/crop/${crop_id}/management_plan/${plan_id}/repeat`,
        `/crop/${crop_id}/management_plan/${plan_id}/repeat_confirmation`,
      ]),
    );
    history.push(`/crop/${crop_id}/management_plan/${plan_id}/repeat`);
  };

  const [showCompleteFailModal, setShowCompleteFailModal] = useState(false);
  const [showCopyRepeatMenu, setShowCopyRepeatMenu] = useState(false);

  const onMarkComplete = () => {
    if (hasPendingTasks) {
      setShowCompleteFailModal(true);
    } else {
      onCompleted();
    }
  };

  const isActiveOrPlanned = !plan?.abandon_date && !plan?.complete_date;

  const [isDeleting, setIsDeleting] = useState(false);

  const preDelete = () => {
    setIsDeleting(true);
  };

  return (
    <Layout
      buttonGroup={
        isAdmin &&
        isActiveOrPlanned && (
          <>
            <Button color={'secondary'} fullLength onClick={onAbandon}>
              {t('MANAGEMENT_DETAIL.ABANDON_PLAN')}
            </Button>

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
        {isAdmin && (
          <BsThreeDotsVertical
            className={styles.menuIcon}
            onClick={() => {
              setShowCopyRepeatMenu((prev) => !prev);
            }}
          />
        )}

        {isAdmin && showCopyRepeatMenu && (
          <ClickAwayListener onClickAway={() => setShowCopyRepeatMenu(false)}>
            <div className={styles.copyRepeatMenu}>
              {/* <Main className={styles.menuItem}>Copy crop plan</Main> */}
              <Main
                className={styles.menuItem}
                onClick={() => onRepeatPlan(plan.crop_variety_id, plan.management_plan_id)}
              >
                {t('REPEAT_PLAN.MENU')}
              </Main>
            </div>
          </ClickAwayListener>
        )}
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

      {showCompleteFailModal && (
        <IncompleteTaskModal dismissModal={() => setShowCompleteFailModal(false)} />
      )}

      <div className={styles.deleteSection} onClick={() => setShowCopyRepeatMenu(false)}>
        {isAdmin && isActiveOrPlanned && !isDeleting && (
          <IconLink
            className={styles.deleteText}
            style={{ color: 'var(--grey600)' }}
            icon={
              <TrashIcon
                style={{
                  fill: 'var(--grey600)',
                  stroke: 'var(--grey600)',
                  transform: 'translate(0px, 6px)',
                }}
              />
            }
            onClick={preDelete}
            isIconClickable
          >
            {t('MANAGEMENT_PLAN.DELETE.DELETE_PLAN')}
          </IconLink>
        )}

        {isDeleting && !eligibleForDeletion && (
          <DeleteBox
            color="warning"
            onOk={onAbandon}
            onCancel={() => setIsDeleting(false)}
            header={t('MANAGEMENT_PLAN.DELETE.CANT_DELETE_MODIFIED_PLAN')}
            headerIcon={<FiAlertTriangle />}
            message={t('MANAGEMENT_PLAN.DELETE.CANT_DELETE_ABANDON_INSTEAD')}
            primaryButtonLabel={t('MANAGEMENT_PLAN.DELETE.CANT_DELETE_ABANDON')}
          />
        )}

        {isDeleting && eligibleForDeletion && (
          <DeleteBox
            color="error"
            onOk={onDelete}
            onCancel={() => setIsDeleting(false)}
            header={t('MANAGEMENT_PLAN.DELETE.DELETE_PLAN_QUESTION')}
            headerIcon={<TrashIcon />}
            message={t('MANAGEMENT_PLAN.DELETE.DELETE_PLAN_MESSAGE')}
            primaryButtonLabel={t('MANAGEMENT_PLAN.DELETE.CONFIRM_DELETION')}
          />
        )}
      </div>
    </Layout>
  );
}

PureManagementTasks.prototype = {
  onBack: PropTypes.func,
  onCompleted: PropTypes.func,
  plan: PropTypes.object,
  isAdmin: PropTypes.bool,
  onAbandon: PropTypes.func,
  onDelete: PropTypes.func,
  eligibleForDeletion: PropTypes.bool,
};
