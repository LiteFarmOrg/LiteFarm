/*
 *  Copyright 2026 LiteFarm.org
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
import { EntityType } from '../../../containers/Finances/types';
import styles from './styles.module.scss';

type EntityTypeOption = Exclude<EntityType, null>;

export interface EntityAssociationToggleProps {
  value: EntityType;
  onChange?: (value: EntityType) => void;
  isDisabled?: boolean;
}

function EntityAssociationToggle({ value, onChange, isDisabled }: EntityAssociationToggleProps) {
  const { t } = useTranslation();

  const handleClick = (clicked: EntityTypeOption) => {
    onChange?.(value === clicked ? null : clicked);
  };

  const generateEntityTypeButtonProps = (type: EntityTypeOption) => ({
    selected: value === type,
    onClick: () => handleClick(type),
    disabled: isDisabled,
  });

  return (
    <div className={styles.wrapper}>
      <InputBaseLabel label={t('REVENUE.ADD_REVENUE.ENTITY_ASSOCIATION_LABEL')} optional={true} />
      <div className={styles.buttonGroup}>
        <EntityTypeButton {...generateEntityTypeButtonProps('crop')}>
          <CropIcon />
          <span>{t('MENU.CROPS')}</span>
        </EntityTypeButton>
        <EntityTypeButton {...generateEntityTypeButtonProps('animal')}>
          <AnimalIcon />
          <span>{t('MENU.ANIMALS')}</span>
        </EntityTypeButton>
      </div>
    </div>
  );
}

interface EntityTypeButtonProps {
  selected: boolean;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}

function EntityTypeButton({ selected, onClick, disabled, children }: EntityTypeButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(styles.button, selected && styles.selected)}
    >
      {children}
    </button>
  );
}

export default EntityAssociationToggle;
