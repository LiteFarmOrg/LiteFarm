/*
 *  Copyright 2023 LiteFarm.org
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
import { forwardRef } from 'react';
import FloatingButtonMenu from '../../../components/Menu/FloatingButtonMenu';
import FloatingMenu from '../../../components/Menu/FloatingButtonMenu/FloatingMenu';
import { componentDecorators } from '../../Pages/config/Decorators';

export default {
  title: 'Components/Menu/FloatingButtonMenu',
  component: FloatingButtonMenu,
  decorators: componentDecorators,
};

export const withOptions = {
  args: {
    type: 'add',
    options: [
      { label: '+ Add Revenue', onClick: () => console.log('Add Revenue') },
      { label: '+ Add Expense', onClick: () => console.log('Add Expense') },
    ],
  },
};

const Menu = forwardRef((props, ref) => {
  return (
    <FloatingMenu
      ref={ref}
      options={[
        { label: '+ Add Revenue', onClick: () => console.log('Add Revenue') },
        { label: '+ Add Expense', onClick: () => console.log('Add Expense') },
      ]}
      {...props}
    />
  );
});
Menu.displayName = 'Menu';

export const withMenu = {
  args: {
    type: 'add',
    Menu,
  },
};
