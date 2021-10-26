import React from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as CalendarIcon } from '../../../assets/images/task/Calendar.svg';
import { ReactComponent as UnassignedIcon } from '../../../assets/images/task/Unassigned.svg';
import { ReactComponent as CustomIcon } from '../../../assets/images/task/Custom.svg';
import { ReactComponent as RecordSoilSample } from '../../../assets/images/task/RecordSoilSample.svg';
import { ReactComponent as Sales } from '../../../assets/images/task/Sales.svg';
import { ReactComponent as Scout } from '../../../assets/images/task/Scout.svg';
import { ReactComponent as WashAndPack } from '../../../assets/images/task/WashAndPack.svg';
import { ReactComponent as Transplant } from '../../../assets/images/task/Transplant.svg';
import { ReactComponent as Harvest } from '../../../assets/images/task/Harvest.svg';
import { ReactComponent as PestControl } from '../../../assets/images/task/PestControl.svg';
import { ReactComponent as Irrigate } from '../../../assets/images/task/Irrigate.svg';
import { ReactComponent as Transport } from '../../../assets/images/task/Transport.svg';
import { ReactComponent as FieldWork } from '../../../assets/images/task/FieldWork.svg';
import { ReactComponent as Plant } from '../../../assets/images/task/Plant.svg';
import { ReactComponent as SocialEvent } from '../../../assets/images/task/SocialEvent.svg';
import { ReactComponent as Clean } from '../../../assets/images/task/Clean.svg';
import { ReactComponent as SoilAmendment } from '../../../assets/images/task/SoilAmendment.svg';
import styles from './styles.module.scss';

import { useTranslation } from 'react-i18next';
import { CardWithStatus } from '../index';
import i18n from '../../../locales/i18n';
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

export const taskStatusText = {
  forReview: i18n.t('TASK.STATUS.FOR_REVIEW'),
  planned: i18n.t('TASK.STATUS.PLANNED'),
  completed: i18n.t('TASK.STATUS.COMPLETED'),
  late: i18n.t('TASK.STATUS.LATE'),
  abandoned: i18n.t('TASK.STATUS.ABANDONED'),
};

const iconDict = {
  CLEANING_TASK: Clean, // for release
  HARVEST_TASK: Harvest, // for release
  PEST_CONTROL_TASK: PestControl, // for release
  PLANT_TASK: Plant, // for release
  FIELD_WORK_TASK: FieldWork, // for release
  TRANSPLANT_TASK: Transplant, // for release
  SOIL_AMENDMENT_TASK: SoilAmendment, // for release
  BED_PREPARATION_TASK: CustomIcon,
  SALE_TASK: Sales,
  FERTILIZING: SoilAmendment, // soil amendment replaces fertilizing
  SCOUTING_TASK: Scout,
  WASH_AND_PACK_TASK: WashAndPack,
  OTHER_TASK: CustomIcon,
  BREAK_TASK: CustomIcon,
  SOIL_TASK: RecordSoilSample,
  IRRIGATION_TASK: Irrigate,
  TRANSPORT_TASK: Transport,
  SOCIAL_TASK: SocialEvent,
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
  selected,
  happiness,
  classes = { card: {} },
  ...props
}) => {
  const { t } = useTranslation();
  const isCustomType = !!taskType.farm_id;
  const TaskIcon = isCustomType ? CustomIcon : iconDict[taskType.task_translation_key];
  const onAssignTask = (e) => {
    e.stopPropagation();
    onClickAssignee?.();
  };
  return (
    <CardWithStatus
      color={selected ? activeCardColorMap[status] : statusColorMap[status]}
      style={style}
      status={status}
      label={taskStatusText[status]}
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
      happiness={happiness}
    >
      <TaskIcon className={styles.taskIcon} />
      <div className={styles.info}>
        <div className={styles.mainTypographySansColor}>
          {t(`task:${taskType.task_translation_key}`)}
        </div>
        <div className={styles.subMain}>
          {locationName || t('TASK.CARD.MULTIPLE_LOCATIONS')}{' '}
          {cropVarietyName && `| ${cropVarietyName || t('TASK.CARD.MULTIPLE_CROPS')}`}
        </div>
        <div className={styles.dateUserContainer}>
          <div className={styles.iconTextContainer}>
            <CalendarIcon />
            <div>{completeOrDueDate}</div>
          </div>
          {assignee ? (
            <div
              className={styles.iconTextContainer}
              onClick={onAssignTask}
              style={{ cursor: onClickAssignee ? 'pointer' : 'default' }}
            >
              <div className={clsx(styles.firstInitial, styles.icon)}>
                {assignee.first_name.toUpperCase().charAt(0)}
              </div>
              <div>{`${assignee.first_name} ${assignee.last_name.charAt(0)}.`}</div>
            </div>
          ) : (
            <div
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
  selected: PropTypes.bool,
};
