import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Happiness, TaskStatus, TaskType } from '../../../../../domain/tasks';
import { User } from '../../../../../domain/users';
import { SupportedLocale } from '../../../locales/supportedLocales';
import { ReactComponent as CalendarIcon } from '../../../assets/images/task/Calendar.svg';
import { ReactComponent as UnassignedIcon } from '../../../assets/images/task/Unassigned.svg';
import getTaskTypeIcon from '../../util/getTaskTypeIcon';
import { CardWithStatus } from '../index';
import styles from './styles.module.scss';
import { TaskMoreButton } from './TaskMoreButton';
import { PinnedIcon } from './PinnedIcon';

const statusColorMap = {
  planned: 'secondary',
  late: 'secondary',
  completed: 'completed',
  abandoned: 'completed',
  forReview: 'primary',
} as const;

const activeCardColorMap = {
  planned: 'taskCurrentActive',
  late: 'taskCurrentActive',
  completed: 'taskMarkedActive',
  abandoned: 'taskMarkedActive',
  forReview: 'primary',
} as const;

export const taskStatusTranslateKey = {
  forReview: 'FOR_REVIEW',
  planned: 'PLANNED',
  completed: 'COMPLETED',
  late: 'LATE',
  abandoned: 'ABANDONED',
} as const;

const getDate = (date: string, language = 'en') => {
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(date));
};

interface Props {
  taskType: TaskType;
  status: TaskStatus;
  locationName: string;
  cropVarietyName: string;
  completeOrDueDate: string;
  assignee?: User | null;
  style: React.CSSProperties;
  onClick?: (() => void) | null;
  onClickAssignee?: (() => void) | null;
  onClickCompleteOrDueDate?: (() => void) | null;
  onPin: () => void;
  onUnpin: () => void;
  selected: boolean;
  happiness: Happiness;
  classes: { card: {}; container?: {} };
  isAdmin: boolean;
  isAssignee: boolean;
  language: SupportedLocale;
  pinned: boolean;
  abandonDate: string;
}

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
  onPin = () => {},
  onUnpin = () => {},
  selected,
  happiness,
  classes = { card: {}, container: {} },
  isAdmin,
  isAssignee,
  language,
  pinned,
  ...props
}: Props) => {
  const { t } = useTranslation();
  const isCustomType = !!taskType.farm_id;
  const TaskIcon = getTaskTypeIcon(isCustomType ? 'CUSTOM_TASK' : taskType.task_translation_key);
  const onAssignTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClickAssignee?.();
  };
  const onAssignDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClickCompleteOrDueDate?.();
  };

  const isAssigneeInactive = assignee?.status === 'Inactive';
  let assigneeName = '';
  if (assignee !== null) {
    const lastName =
      assignee.last_name.length > 0 ? assignee.last_name.toUpperCase().charAt(0) + '.' : '';
    assigneeName = `${assignee.first_name} ${lastName}`;
  }

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
        <div className={styles.mainTypographySansColor}>
          {t(`task:${taskType.task_translation_key}`)}
          {pinned && <PinnedIcon />}
          <TaskMoreButton pinned={pinned} onPin={onPin} onUnpin={onUnpin} />
        </div>
        <div className={styles.subMain}>
          {locationName || t('TASK.CARD.MULTIPLE_LOCATIONS')}
          {cropVarietyName && ` | ${cropVarietyName}`}
        </div>
        <div onClick={onAssignDate} className={styles.dateUserContainer}>
          <div
            className={
              status === 'completed' || status === 'abandoned' || !isAdmin
                ? styles.iconTextContainerNoUnderline
                : styles.iconTextContainer
            }
          >
            <CalendarIcon />
            <div data-cy="taskCard-dueDate">
              {getDate(status === 'abandoned' ? props['abandonDate'] : completeOrDueDate, language)}
            </div>
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
              <div
                className={clsx(
                  styles.firstInitial,
                  styles.icon,
                  isAssigneeInactive ? styles.inactive : '',
                )}
              >
                {assignee.first_name.toUpperCase().charAt(0)}
              </div>
              <div className={clsx(isAssigneeInactive ? styles.inactive : '')}>
                {isAssigneeInactive
                  ? `${assigneeName} (${t('STATUS.INACTIVE').toLowerCase()})`
                  : assigneeName}
              </div>
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
