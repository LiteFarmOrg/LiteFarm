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
import StateTabs from '../../components/RouterTab/StateTab';
import { componentDecorators } from '../Pages/config/Decorators';

const meta = {
  title: 'Components/RouterTab/StateTabs',
  component: StateTabs,
  decorators: [
    ...componentDecorators,
    (Story) => {
      const [state, setState] = useState('WEIGHT');

      return <Story state={state} setState={setState} />;
    },
  ],
  args: {
    state: 'WEIGHT',
    tabs: [
      { key: 'WEIGHT', label: 'Weight' },
      { key: 'APPLICATION_RATE', label: 'Application rate' },
    ],
  },
};

export const Pill = {
  render: (args, context) => {
    return <StateTabs {...args} {...context} kind="pill" />;
  },
};

export const PillThreeTabs = {
  render: (args, context) => {
    return (
      <StateTabs
        {...args}
        {...context}
        kind="pill"
        tabs={[
          { key: 'WEIGHT', label: 'Weight' },
          { key: 'APPLICATION_RATE', label: 'Application rate' },
          { key: 'OTHER', label: 'Other' },
        ]}
      />
    );
  },
};

export const Plane = {
  render: (args, context) => {
    return (
      <>
        <StateTabs {...args} {...context} kind="plane" />
        <div
          style={{
            height: '100px',
            border: '1px solid #d0d4db',
            borderTop: 'none',
            backgroundColor: '#fff',
          }}
        ></div>
      </>
    );
  },
};

export default meta;
