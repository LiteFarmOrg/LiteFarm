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

import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../Pages/config/Decorators';
import QuantityApplicationRate from '../../components/Task/AddSoilAmendmentProducts/QuantityApplicationRate';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof QuantityApplicationRate> = {
  title: 'Components/QuantityApplicationRate',
  component: QuantityApplicationRate,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative' }}>
        <Story />
      </div>
    ),
    ...componentDecorators,
  ],
  args: {},
};
export default meta;

type Story = StoryObj<typeof QuantityApplicationRate>;

export const Alternate: Story = {
  args: {},
};
