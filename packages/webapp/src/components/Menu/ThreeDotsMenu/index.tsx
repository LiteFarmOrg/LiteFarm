/*
 *  Copyright 2024 LiteFarm.org
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
import { forwardRef, ReactNode } from 'react';
import clsx from 'clsx';
import { BsThreeDots } from 'react-icons/bs';
import FloatingMenu from '../FloatingButtonMenu/FloatingMenu';
import DropdownButton from '../../Form/DropDownButton';
import styles from './styles.module.scss';

export type ThreeDotsMenuProps = {
  classes?: { button?: string };
  options: { label: ReactNode; onClick: () => void }[];
};

const ThreeDotsMenu = ({ options, classes }: ThreeDotsMenuProps) => {
  return (
    <DropdownButton
      type={'v2'}
      noIcon
      classes={{ button: clsx(styles.menuButton, classes?.button) }}
      Menu={forwardRef((menuProps, ref) => (
        <FloatingMenu
          ref={ref}
          options={options}
          classes={{ menuItem: styles.menuItem }}
          {...menuProps}
        />
      ))}
      menuPositionOffset={[0, 1]}
    >
      <BsThreeDots className={styles.menuIcon} />
    </DropdownButton>
  );
};

export default ThreeDotsMenu;
