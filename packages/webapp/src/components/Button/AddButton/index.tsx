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
import { ElementType } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import Button from '../../Form/Button';
import DropdownButton from '../../Form/DropDownButton';
import FloatingActionButton from '../FloatingActionButton';
import FloatingButtonMenu from '../../Menu/FloatingButtonMenu';
import PlusCircleIcon from '../../../assets/images/plus-circle.svg?react';
import styles from './styles.module.scss';

export type AddButtonProps = {
  label: string;
  onClick?: () => void;
  Menu?: ElementType;
  disabled?: boolean;
  className?: string;
};

const AddButton = ({ label, onClick, Menu, disabled, className }: AddButtonProps) => {
  const theme = useTheme();
  const isAboveBreakPoint = useMediaQuery(theme.breakpoints.up('md'));

  if (Menu) {
    return isAboveBreakPoint ? (
      <DropdownButton
        type={'v2'}
        noIcon={true}
        Menu={Menu}
        disabled={disabled}
        classes={{ button: className }}
      >
        <PlusCircleIcon />
        {label}
      </DropdownButton>
    ) : (
      <FloatingButtonMenu
        type={'add'}
        Menu={Menu}
        disabled={disabled}
        classes={{ button: className }}
      />
    );
  }

  if (isAboveBreakPoint) {
    return (
      <Button color="primary" md onClick={onClick} disabled={disabled} className={className}>
        <PlusCircleIcon />
        {label}
      </Button>
    );
  }

  return (
    <div className={styles.floatingWrapper}>
      <FloatingActionButton
        // @ts-expect-error
        type={'add'}
        onClick={onClick}
        aria-label={label}
        disabled={disabled}
        className={className}
      />
    </div>
  );
};

export default AddButton;
