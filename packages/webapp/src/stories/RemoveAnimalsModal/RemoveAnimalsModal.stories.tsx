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

import RemoveAnimalsModal from '../../components/Animals/RemoveAnimalsModal';
import { Suspense } from 'react';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof RemoveAnimalsModal> = {
  title: 'Components/RemoveAnimalsModal',
  component: RemoveAnimalsModal,
  decorators: [
    (Story) => (
      <Suspense fallback={'loading'}>
        <Story />
      </Suspense>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RemoveAnimalsModal>;

export const Primary: Story = {
  args: {
    isOpen: true,
  },
};

export const WithSuccessMessage: Story = {
  args: {
    isOpen: true,
    showSuccessMessage: true,
  },
};
