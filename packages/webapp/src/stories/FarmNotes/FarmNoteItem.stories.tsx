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
import FarmNoteItem from '../../components/FarmNotes/FarmNoteItem';
import { componentDecorators } from '../Pages/config/Decorators';

const baseNote = {
  farm_note_id: 'note-1',
  farm_id: 'farm-1',
  user_id: 'user-1',
  note: 'Fence damage spotted on the east side of Field 3, about 20m from the gate. Looks like something pushed through overnight. 2 staples missing, top wire loose, post cracked at ground level.',
  is_private: false,
  created_at: new Date().toISOString(),
};

export default {
  title: 'Components/FarmNotes/FarmNoteItem',
  component: FarmNoteItem,
  decorators: componentDecorators,
  args: {
    note: baseNote,
    authorName: 'Denis D',
    isAuthor: false,
    isExpanded: false,
    onToggle: () => console.log('toggle'),
    onEdit: () => console.log('edit'),
    onDelete: () => console.log('delete'),
    onImageClick: (src: string) => console.log('image click', src),
  },
} as Meta<typeof FarmNoteItem>;

type Story = StoryObj<typeof FarmNoteItem>;

export const CollapsedPublic: Story = {};

export const CollapsedPrivate: Story = {
  args: {
    note: { ...baseNote, is_private: true },
  },
};

export const ExpandedWithoutImage: Story = {
  args: { isExpanded: true },
};

export const ExpandedWithImage: Story = {
  args: {
    isExpanded: true,
    note: {
      ...baseNote,
      image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&q=80',
    },
  },
};

export const ExpandedAsAuthor: Story = {
  args: {
    isExpanded: true,
    isAuthor: true,
  },
};

export const PendingSync: Story = {
  args: {
    note: { ...baseNote, to_sync: true },
  },
};

export const PastDate: Story = {
  args: {
    note: { ...baseNote, created_at: '2025-12-01T09:00:00.000Z' },
  },
};
