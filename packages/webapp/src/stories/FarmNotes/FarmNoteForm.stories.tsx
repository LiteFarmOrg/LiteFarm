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

import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../Pages/config/Decorators';
import FarmNoteForm, { type FarmNoteFormProps } from '../../components/FarmNotes/FarmNoteForm';

const meta: Meta<FarmNoteFormProps> = {
  title: 'Components/FarmNotes/FarmNoteForm',
  component: FarmNoteForm,
  decorators: componentDecorators,
  args: {
    onSubmit: (data, imageFile) => console.log('submit', data, imageFile),
    onCancel: () => console.log('cancel'),
    onClose: () => console.log('close'),
  },
};
export default meta;

type Story = StoryObj<typeof FarmNoteForm>;

/** Pristine new note — Save is disabled */
export const NewNote: Story = {
  args: {
    title: 'New note',
  },
};

/** Edit mode — form is pre-populated and Save is enabled */
export const EditNote: Story = {
  args: {
    title: 'Edit note',
    defaultValues: {
      note: 'Fence damage spotted on the east side of Field 3.',
      isPrivate: false,
      imageUrl: '/src/assets/images/certification/Farmland.svg',
    },
  },
};

/** Private note pre-filled */
export const PrivateNote: Story = {
  args: {
    title: 'Edit note',
    defaultValues: {
      note: 'Reminder to buy more cow feed supplement.',
      isPrivate: true,
    },
  },
};
