/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import React from 'react';
import clsx from 'clsx';
import { ReactComponent as UncheckedEnabled } from '../../../../assets/images/unchecked-enabled.svg';
import { ReactComponent as CheckedEnabled } from '../../../../assets/images/checked-enabled.svg';
import { BsChevronRight } from 'react-icons/bs';
import Icon, { IconName } from '../../../Icons';
import styles from './styles.module.scss';
import ElapsedTimeWidget from '../../../Widgets/ElapsedTime';
import { StatusIndicatorPill, StatusIndicatorPillProps } from '../../../StatusIndicatorPill';

type IconTextProps = {
  iconName: IconName;
  label: string;
  classes?: {
    icon?: string;
    label?: string;
  };
};

const IconText = ({ iconText }: { iconText: IconTextProps }) => {
  const { iconName, label, classes } = iconText;
  return (
    <div className={styles.iconText}>
      {iconName && <Icon iconName={iconName} className={clsx(styles.icon, classes?.icon)} />}
      {label && (
        <div className={clsx(styles.content, styles.content_label, classes?.label)}>{label}</div>
      )}
    </div>
  );
};

type MiddleContentProps = {
  name: string;
  status: StatusIndicatorPillProps;
  classes?: {
    layout?: string;
  };
};

enum ActionIcons {
  CHECKBOX = 'checkbox',
  CHEVRON = 'chevron',
}

type ActionIconProps = {
  iconName: ActionIcons;
  selected?: boolean;
  onClick: () => void;
  classes?: {
    icon?: string;
  };
};

const ActionIcon = ({ actionIcon }: { actionIcon: ActionIconProps }) => {
  const { iconName, selected, classes, onClick } = actionIcon;
  if (iconName === ActionIcons.CHECKBOX) {
    return selected ? (
      <CheckedEnabled
        className={clsx(styles.checkbox, styles.pointer, classes?.icon)}
        onClick={onClick}
      />
    ) : (
      <UncheckedEnabled className={clsx(styles.checkbox, classes?.icon)} onClick={onClick} />
    );
  } else if (iconName === ActionIcons.CHEVRON) {
    return (
      <BsChevronRight
        className={clsx(styles.chevron, styles.pointer, classes?.icon && classes.icon)}
        onClick={onClick}
      />
    );
  } else {
    return null;
  }
};

interface SensorListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  iconText: IconTextProps;
  middleContent: MiddleContentProps;
  actionIcon: ActionIconProps;
  lastSeen: Date;
  showLastSeen: boolean;
  onlyActionClick: boolean;
}

export default function SensorListItem({
  iconText,
  middleContent,
  actionIcon,
  lastSeen,
  showLastSeen = true,
  onClick,
  onlyActionClick = true,
  className,
  ...rest
}: SensorListItemProps) {
  return (
    <li
      onClick={onlyActionClick ? undefined : onClick}
      className={clsx(
        styles.sensorListItem,
        actionIcon.selected && styles.listItem__selected,
        !onlyActionClick && styles.pointer,
        className,
      )}
      {...rest}
    >
      <div className={styles.leftAlignedContent}>
        <IconText iconText={iconText} />
        <div className={styles.mobileOnlyLeftContent}>
          <span className={styles.middleText}>{middleContent.name}</span>
        </div>
      </div>

      <div className={styles.desktopOnlyMiddleContent}>
        <div className={styles.middleText}>{middleContent.name}</div>
      </div>
      {middleContent.status && <StatusIndicatorPill {...middleContent.status} />}
      <div className={styles.rightAlignedContent}>
        {showLastSeen && <ElapsedTimeWidget pastDate={lastSeen} />}
        <ActionIcon actionIcon={actionIcon} />
      </div>
    </li>
  );
}
