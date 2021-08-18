import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Card from '../Card';
import StatusLabel from './StatusLabel';
import { ReactComponent as CalendarIcon } from '../../assets/images/task/Calendar.svg';
import { ReactComponent as UnassignedIcon } from '../../assets/images/task/Unassigned.svg';
import { ReactComponent as CustomIcon } from '../../assets/images/task/Custom.svg';
import { ReactComponent as RecordSoilSample } from '../../assets/images/task/RecordSoilSample.svg';
import { ReactComponent as Sales } from '../../assets/images/task/Sales.svg';
import { ReactComponent as Scout } from '../../assets/images/task/Scout.svg';
import { ReactComponent as Fertilize } from '../../assets/images/task/Fertilize.svg';
import { ReactComponent as WashAndPack } from '../../assets/images/task/WashAndPack.svg';
import { ReactComponent as Transplant } from '../../assets/images/task/Transplant.svg';
import { ReactComponent as Harvest } from '../../assets/images/task/Harvest.svg';
import { ReactComponent as PestControl } from '../../assets/images/task/PestControl.svg';
import { ReactComponent as Irrigate } from '../../assets/images/task/Irrigate.svg';
import { ReactComponent as Transport } from '../../assets/images/task/Transport.svg';
import { ReactComponent as FieldWork } from '../../assets/images/task/FieldWork.svg';
import { ReactComponent as Plant } from '../../assets/images/task/Plant.svg';
import { ReactComponent as SocialEvent } from '../../assets/images/task/SocialEvent.svg';
import { ReactComponent as Clean } from '../../assets/images/task/Clean.svg';
import { ReactComponent as SoilAmendment } from '../../assets/images/task/SoilAmendment.svg';

import { useTranslation } from 'react-i18next';
import Rating from '../Rating';

const cardColor = {
  planned: 'taskCurrent',
  late: 'taskCurrent',
  completed: 'taskMarked',
  abandoned: 'taskMarked',
};

const activeCardColor = {
  planned: 'taskCurrentActive',
  late: 'taskCurrentActive',
  completed: 'taskMarkedActive',
  abandoned: 'taskMarkedActive',
};

const iconDict = {
  CLEANING: Clean, // for release
  HARVESTING: Harvest, // for release
  PEST_CONTROL: PestControl, // for release
  PLANTING: Plant, // for release
  FIELD_WORK: FieldWork, // for release
  TRANSPLANT: Transplant, // for release
  SOIL_AMENDMENT: SoilAmendment, // for release
  BED_PREPARATION: CustomIcon,
  SALES: Sales,
  FERTILIZING: SoilAmendment, // soil amendment replaces fertilizing
  SCOUTING: Scout,
  WASH_AND_PACK: WashAndPack,
  OTHER: CustomIcon,
  BREAK: CustomIcon,
  SOIL_RESULTS: RecordSoilSample,
  IRRIGATION: Irrigate,
  TRANSPORT: Transport,
  SOCIAL: SocialEvent,
};

const PureTaskCard = ({
  taskType,
  status,
  locations,
  crops,
  dueDate,
  assignee = null,
  style,
  onClick = null,
  onClickAssignee = null,
  selected,
  happiness,
  ...props
}) => {
  const { t } = useTranslation();
  if (!locations.length) console.error('Task should be associated with at least one location');
  const locationText = locations.length > 1 ? t('TASK.CARD.MULTIPLE_LOCATIONS') : locations[0].name;
  const cropText = crops.length > 1 ? t('TASK.CARD.MULTIPLE_CROPS') : t(`crop:${crops[0]}`);
  const dateText = new Date(dueDate).toDateString().slice(4);
  const TaskIcon = iconDict[taskType.task_translation_key];

  return (
    <div className={styles.cardContainer}>
      <div className={styles.statusLabel}>
        <StatusLabel status={status} />
        {happiness !== null && status === 'completed' && (
          <Rating stars={happiness} viewOnly={true} />
        )}
      </div>
      <Card
        color={selected ? activeCardColor[status] : cardColor[status]}
        onClick={onClick}
        className={styles.card}
        style={{
          cursor: onClick ? 'pointer' : 'default',
          ...style,
        }}
        {...props}
      >
        <TaskIcon className={styles.taskIcon} />
        <div className={styles.info}>
          <div className={styles.mainTypographySansColor}>
            {t(`task:${taskType.task_translation_key}`)}
          </div>
          <div className={styles.subMain}>{`${locationText} | ${cropText}`}</div>
          <div className={styles.dateUserContainer}>
            <div className={styles.iconTextContainer}>
              <CalendarIcon className={styles.icon} />
              <div>{dateText}</div>
            </div>
            {assignee ? (
              <div
                className={styles.iconTextContainer}
                onClick={onClickAssignee}
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
                onClick={onClickAssignee}
                style={{ cursor: onClickAssignee ? 'pointer' : 'default' }}
              >
                <UnassignedIcon className={styles.icon} />
                <div>{t('TASK.UNASSIGNED')}</div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

PureTaskCard.propTypes = {
  color: PropTypes.oneOf(['secondary', 'active', 'disabled']),
  onClick: PropTypes.func,
  ownerName: PropTypes.string,
  farmName: PropTypes.string,
  address: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object,
};

export default PureTaskCard;
