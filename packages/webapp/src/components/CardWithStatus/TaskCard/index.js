import React from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as CustomIcon } from '../../assets/images/task/Custom.svg';
import { ReactComponent as RecordSoilSample } from '../../assets/images/task/RecordSoilSample.svg';
import { ReactComponent as Sales } from '../../assets/images/task/Sales.svg';
import { ReactComponent as Scout } from '../../assets/images/task/Scout.svg';
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
import { managementPlanStatusText } from '../ManagementPlanCard/ManagementPlanCard';
import { CardWithStatus } from '../index';

const statusColorMap = {
  planned: 'secondary',
  late: 'secondary',
  completed: 'completed',
  abandoned: 'completed',
};

const activeCardColor = {
  planned: 'taskCurrentActive',
  late: 'taskCurrentActive',
  completed: 'taskMarkedActive',
  abandoned: 'taskMarkedActive',
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

const PureTaskCard = ({
  taskType,
  status,
  locationName,
  cropVarietyName,
  dueDate,
  assignee = null,
  style,
  onClick = null,
  onClickAssignee = null,
  selected,
  score,
  classes,
  ...props
}) => {
  const { t } = useTranslation();
  const isCustomType = !!taskType.farm_id;
  const TaskIcon = isCustomType ? CustomIcon : iconDict[taskType.task_translation_key];

  return (
    <CardWithStatus
      color={statusColorMap[status]}
      style={style}
      status={status}
      label={managementPlanStatusText[status]}
      classes={{ ...classes, card: { padding: '12px', ...classes.card } }}
      onClick={onClick}
      score={score}
    ></CardWithStatus>
    // <div className={styles.cardContainer}>
    //   <div className={styles.statusLabel}>
    //     <StatusLabel status={status} />
    //     {happiness !== null && happiness !== 0 && status === 'completed' && (
    //       <Rating stars={happiness} viewOnly={true} />
    //     )}
    //   </div>
    //   <Card
    //     color={selected ? activeCardColor[status] : cardColor[status]}
    //     onClick={onClick}
    //     className={styles.card}
    //     style={{
    //       cursor: onClick ? 'pointer' : 'default',
    //       ...style,
    //     }}
    //     {...props}
    //   >
    //     <TaskIcon className={styles.taskIcon} />
    //     <div className={styles.info}>
    //       <div className={styles.mainTypographySansColor}>
    //         {t(`task:${taskType.task_translation_key}`)}
    //       </div>
    //       <div className={styles.subMain}>
    //         {locationName || t('TASK.CARD.MULTIPLE_LOCATIONS')} {cropVarietyName && `| ${cropVarietyName || t('TASK.CARD.MULTIPLE_CROPS')}`}
    //       </div>
    //       <div className={styles.dateUserContainer}>
    //         <div className={styles.iconTextContainer}>
    //           <CalendarIcon className={styles.icon} />
    //           <div>{dueDate}</div>
    //         </div>
    //         {assignee ? (
    //           <div
    //             className={styles.iconTextContainer}
    //             onClick={onClickAssignee}
    //             style={{ cursor: onClickAssignee ? 'pointer' : 'default' }}
    //           >
    //             <div className={clsx(styles.firstInitial, styles.icon)}>
    //               {assignee.first_name.toUpperCase().charAt(0)}
    //             </div>
    //             <div>{`${assignee.first_name} ${assignee.last_name.charAt(0)}.`}</div>
    //           </div>
    //         ) : (
    //           <div
    //             className={clsx(styles.iconTextContainer, styles.unassigned)}
    //             onClick={onClickAssignee}
    //             style={{ cursor: onClickAssignee ? 'pointer' : 'default' }}
    //           >
    //             <UnassignedIcon className={styles.icon} />
    //             <div>{t('TASK.UNASSIGNED')}</div>
    //           </div>
    //         )}
    //       </div>
    //     </div>
    //   </Card>
    // </div>
  );
};

PureTaskCard.propTypes = {
  color: PropTypes.oneOf(['secondary', 'active', 'disabled']),
  onClick: PropTypes.func,
  ownerName: PropTypes.string,
  farmName: PropTypes.string,
  address: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object,
  cropVarietyNames: PropTypes.arrayOf(PropTypes.string),
};

export default PureTaskCard;
