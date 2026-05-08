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

import clsx from 'clsx';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import InputBaseLabel from '../InputBase/InputBaseLabel';
import { ReactComponent as CropIcon } from '../../../assets/images/nav/crops.svg';
import { ReactComponent as AnimalIcon } from '../../../assets/images/nav/animals.svg';
import styles from './styles.module.scss';

interface EntityToggleButtonProps {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: ReactNode;
  children: ReactNode;
}

function EntityToggleButton({
  selected,
  onClick,
  disabled,
  icon,
  children,
}: EntityToggleButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(styles.button, selected && styles.selected)}
    >
      {icon}
      {children}
    </button>
  );
}

export type EntityValue = 'crop' | 'animal';

export interface EntityAssociationToggleProps {
  value: EntityValue | null;
  onChange: (value: EntityValue | null) => void;
  isDisabled?: boolean;
  label?: string;
  optional?: boolean;
}

function EntityAssociationToggle({
  value,
  onChange,
  isDisabled,
  label,
  optional,
}: EntityAssociationToggleProps) {
  const { t } = useTranslation();

  const handleClick = (clicked: EntityValue) => {
    if (!isDisabled) onChange(value === clicked ? null : clicked);
  };

  return (
    <div className={styles.wrapper}>
      {label && <InputBaseLabel label={label} optional={optional} />}
      <div className={styles.buttonGroup}>
        <EntityToggleButton
          selected={value === 'crop'}
          onClick={() => handleClick('crop')}
          disabled={isDisabled}
          icon={<CropIcon className={styles.icon} />}
        >
          {t('REVENUE.ENTITY_ASSOCIATION.CROPS')}
        </EntityToggleButton>
        <EntityToggleButton
          selected={value === 'animal'}
          onClick={() => handleClick('animal')}
          disabled={isDisabled}
          icon={<AnimalIcon className={styles.icon} />}
        >
          {t('REVENUE.ENTITY_ASSOCIATION.ANIMALS')}
        </EntityToggleButton>
      </div>
    </div>
  );
}

export default EntityAssociationToggle;
