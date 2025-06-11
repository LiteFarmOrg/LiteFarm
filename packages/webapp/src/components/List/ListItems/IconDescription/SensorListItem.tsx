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

type SensorContentProps = {
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
  sensorContent: SensorContentProps;
  actionIcon: ActionIconProps;
  onlyActionClick: boolean;
}

export default function SensorListItem({
  iconText,
  sensorContent,
  actionIcon,
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
      <div className={clsx(styles.leftAlignedContent)}>
        <IconText iconText={iconText} />
        <div className={styles.mobileOnlyLeftContent}>
          <span className={styles.middleText}>{sensorContent.name}</span>
        </div>

        <div className={styles.desktopOnlyMiddleContent}>
          <div className={styles.middleText}>{sensorContent.name}</div>
        </div>
      </div>

      <div className={styles.rightAlignedContent}>
        {sensorContent.status && <StatusIndicatorPill {...sensorContent.status} />}
        <ActionIcon actionIcon={actionIcon} />
      </div>
    </li>
  );
}
