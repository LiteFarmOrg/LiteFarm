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

import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../Pages/config/Decorators';
import {
  CantFindCustomType,
  CantFindCustomTypeProps,
} from '../../components/Finances/PureFinanceTypeSelection/CantFindCustomType';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<CantFindCustomTypeProps> = {
  title: 'Components/CantFindCustomType',
  component: CantFindCustomType,
  decorators: componentDecorators,
  args: {
    onGoToManageCustomType: () => console.log('Navigating to custom type management'),
  },
};
export default meta;

type Story = StoryObj<typeof CantFindCustomType>;

export const Default: Story = {
  args: {
    customTypeMessages: {
      info: 'You can also create your own custom tasks types!',
      manage: 'Manage your custom tasks',
    },
  },
};

export const WithMiscellaneous: Story = {
  render: () => {
    useState;
    const [selected, setSelected] = useState(false);

    const addRemove = () => {
      setSelected((prev) => !prev);
    };

    const miscellaneousConfig = {
      addRemove,
      selected,
    };

    return (
      <CantFindCustomType
        customTypeMessages={{
          info: 'You can also create your own custom expense types!',
          manage: 'Manage your custom expenses',
        }}
        miscellaneousConfig={miscellaneousConfig}
        onGoToManageCustomType={() => console.log('Navigating to custom type management')}
      />
    );
  },
};
