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

import { api } from './apiSlice';
import { farmNoteUrl } from '../../apiConfig';
import { FarmNote } from './types';

export const farmNoteApi = api.injectEndpoints({
  endpoints: (build) => ({
    getFarmNotes: build.query<FarmNote[], void>({
      query: () => ({
        url: farmNoteUrl,
        method: 'GET',
      }),
      providesTags: ['FarmNote'],
    }),
    createFarmNote: build.mutation<
      FarmNote,
      Pick<FarmNote, 'note' | 'is_private'> & { file?: File }
    >({
      query: ({ note, is_private, file }) => {
        const formData = new FormData();
        if (file) {
          formData.append('_file_', file);
        }
        formData.append('data', JSON.stringify({ note, is_private }));
        return {
          url: farmNoteUrl,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['FarmNote'],
    }),
    editFarmNote: build.mutation<FarmNote, Pick<FarmNote, 'farm_note_id' | 'note' | 'is_private'>>({
      query: ({ farm_note_id, ...patch }) => ({
        url: `${farmNoteUrl}/${farm_note_id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['FarmNote'],
    }),
    deleteFarmNote: build.mutation<void, string>({
      query: (farm_note_id) => ({
        url: `${farmNoteUrl}/${farm_note_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FarmNote'],
    }),
  }),
});

export const {
  useGetFarmNotesQuery,
  useCreateFarmNoteMutation,
  useEditFarmNoteMutation,
  useDeleteFarmNoteMutation,
} = farmNoteApi;
