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

import { Meta, StoryObj } from '@storybook/react';
import FarmNoteList from '../../components/FarmNotes/FarmNoteList';
import { componentDecorators } from '../Pages/config/Decorators';

const currentUserId = 'user-1';

const notes = [
  {
    farm_note_id: 'note-1',
    farm_id: 'farm-1',
    user_id: 'user-1',
    note: 'Fence damage spotted on the east side of Field 3, about 20m from the gate.',
    is_private: false,
    created_at: new Date().toISOString(),
  },
  {
    farm_note_id: 'note-2',
    farm_id: 'farm-1',
    user_id: 'user-2',
    note: 'Irrigation system in Block B is running 10 minutes longer than scheduled. Checked the timer — settings look correct. Will monitor tomorrow.',
    is_private: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    farm_note_id: 'note-3',
    farm_id: 'farm-1',
    user_id: 'user-1',
    note: 'Personal reminder: submit soil sample to the lab by end of week.',
    is_private: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const users: Record<string, string> = {
  'user-1': 'Joyce S',
  'user-2': 'Denis D',
};

export default {
  title: 'Components/FarmNotes/FarmNoteList',
  component: FarmNoteList,
  decorators: componentDecorators,
  args: {
    notes,
    users,
    currentUserId,
    onAddNote: () => console.log('add note'),
    onEditNote: (note: (typeof notes)[0]) => console.log('edit', note.farm_note_id),
    onDeleteNote: (note: (typeof notes)[0]) => console.log('delete', note.farm_note_id),
    onImageClick: (src: string) => console.log('image click', src),
  },
} as Meta<typeof FarmNoteList>;

type Story = StoryObj<typeof FarmNoteList>;

export const WithNotes: Story = {};

export const EmptyState: Story = {
  args: { notes: [] },
};

export const WithPendingSync: Story = {
  args: {
    notes: [{ ...notes[0], to_sync: true }, ...notes.slice(1)],
  },
};
