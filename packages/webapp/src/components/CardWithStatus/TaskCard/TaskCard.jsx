import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import { MdMoreHoriz } from 'react-icons/md';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import { Popover } from '@material-ui/core';

import { ReactComponent as CalendarIcon } from '../../../assets/images/task/Calendar.svg';
import { ReactComponent as UnassignedIcon } from '../../../assets/images/task/Unassigned.svg';
import styles from './styles.module.scss';

import getTaskTypeIcon from '../../util/getTaskTypeIcon';

import { useTranslation } from 'react-i18next';
import { CardWithStatus } from '../index';
import clsx from 'clsx';

const statusColorMap = {
  planned: 'secondary',
  late: 'secondary',
  completed: 'completed',
  abandoned: 'completed',
};

const activeCardColorMap = {
  planned: 'taskCurrentActive',
  late: 'taskCurrentActive',
  completed: 'taskMarkedActive',
  abandoned: 'taskMarkedActive',
};

export const taskStatusTranslateKey = {
  forReview: 'FOR_REVIEW',
  planned: 'PLANNED',
  completed: 'COMPLETED',
  late: 'LATE',
  abandoned: 'ABANDONED',
};

export const PureTaskCard = ({
  taskType,
  status,
  locationName,
  cropVarietyName,
  completeOrDueDate,
  assignee = null,
  style,
  onClick = null,
  onClickAssignee = null,
  onClickCompleteOrDueDate = null,
  selected,
  happiness,
  classes = { card: {} },
  isAdmin,
  isAssignee,
  task_id,
  pinnable,
  pinned,
  handlePin,
  ...props
}) => {
  const { t } = useTranslation();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const isCustomType = !!taskType.farm_id;
  const TaskIcon = getTaskTypeIcon(isCustomType ? 'CUSTOM_TASK' : taskType.task_translation_key);
  const onAssignTask = (e) => {
    e.stopPropagation();
    onClickAssignee?.();
  };
  const onAssignDate = (e) => {
    e.stopPropagation();
    onClickCompleteOrDueDate?.();
  };

  let trueDate = completeOrDueDate;
  if (status == 'abandoned') {
    let [day, month, date, year] = new Date(props['abandonDate']).toDateString().split(' ');
    trueDate = `${month} ${date}, ${year}`;
  }

  const togglePinPopover = (event) => {
    // Stop propagation so we're not redirected
    event.stopPropagation();

    setPopoverOpen((currentlyOpen) => !currentlyOpen);
  };

  const handlePinClick = () => {
    setPopoverOpen(false);

    handlePin();
  };

  return (
    <CardWithStatus
      data-cy="taskCard"
      color={selected ? activeCardColorMap[status] : statusColorMap[status]}
      style={style}
      status={status}
      label={t(`TASK.STATUS.${taskStatusTranslateKey[status]}`)}
      classes={{
        ...classes,
        card: {
          display: 'flex',
          flexDirection: 'row',
          minHeight: '98px',
          minWidth: '312px',
          padding: '16px',
          ...classes.card,
        },
      }}
      onClick={onClick}
      score={happiness}
    >
      <TaskIcon className={styles.taskIcon} />
      <div className={styles.info}>
        <div className={styles.titleAndPin}>
          <div className={styles.mainTypographySansColor}>
            {t(`task:${taskType.task_translation_key}`)}
          </div>
          {pinned && <BsPinAngleFill className={styles.pinMarker} />}
          {pinnable && (
            <div className={styles.pinPopoverContainer} onClick={togglePinPopover}>
              <div className={styles.pinPopoverToggle}>
                <MdMoreHoriz />
              </div>
              <div ref={(r) => setAnchor(r)}>
                <Popover
                  id={`pin-popover-${task_id}`}
                  open={popoverOpen}
                  anchorEl={anchor}
                  onClose={() => setPopoverOpen(false)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    left: 5,
                  }}
                >
                  <div className={styles.pinPopoverContent} onClick={handlePinClick}>
                    {pinned ? t('TASK.UNPIN.ACTION') : t('TASK.PIN.ACTION')}
                    <BsPinAngle />
                  </div>
                </Popover>
              </div>
            </div>
          )}
        </div>
        <div className={styles.subMain}>
          {locationName || t('TASK.CARD.MULTIPLE_LOCATIONS')}
          {cropVarietyName && ` | ${cropVarietyName}`}
        </div>
        <div data-cy="taskCard-dueDate" onClick={onAssignDate} className={styles.dateUserContainer}>
          <div
            className={
              status === 'completed' || status === 'abandoned' || !isAdmin
                ? styles.iconTextContainerNoUnderline
                : styles.iconTextContainer
            }
          >
            <CalendarIcon />
            <div>{trueDate}</div>
          </div>
          {assignee ? (
            <div
              className={
                status === 'completed' || status === 'abandoned' || (!isAdmin && !isAssignee)
                  ? styles.iconTextContainerNoUnderline
                  : styles.iconTextContainer
              }
              onClick={onAssignTask}
            >
              <div className={clsx(styles.firstInitial, styles.icon)}>
                {assignee.first_name.toUpperCase().charAt(0)}
              </div>
              <div>{`${assignee.first_name} ${assignee.last_name.charAt(0)}.`}</div>
            </div>
          ) : (
            <div
              data-cy="taskCard-assignee"
              className={clsx(styles.iconTextContainer, styles.unassigned)}
              onClick={onAssignTask}
              style={{ cursor: onClickAssignee ? 'pointer' : 'default' }}
            >
              <UnassignedIcon />
              <div>{t('TASK.UNASSIGNED')}</div>
            </div>
          )}
        </div>
      </div>
    </CardWithStatus>
  );
};

PureTaskCard.propTypes = {
  style: PropTypes.object,
  status: PropTypes.oneOf(['late', 'planned', 'completed', 'abandoned', 'forReview']),
  classes: PropTypes.shape({ container: PropTypes.object, card: PropTypes.object }),
  onClick: PropTypes.func,
  happiness: PropTypes.oneOf([1, 2, 3, 4, 5, 0, null]),
  locationName: PropTypes.string,
  taskType: PropTypes.object,
  cropVarietyName: PropTypes.string,
  completeOrDueDate: PropTypes.string,
  assignee: PropTypes.object,
  onClickAssignee: PropTypes.func,
  onClickCompleteOrDueDate: PropTypes.func,
  selected: PropTypes.bool,
  task_id: PropTypes.number,
  pinned: PropTypes.bool,
  pinnable: PropTypes.bool,
  handlePin: PropTypes.func,
};
