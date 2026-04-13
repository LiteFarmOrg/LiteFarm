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

import { v4 as uuidv4 } from 'uuid';
import i18n from 'i18next';
import { api } from './apiSlice';
import { farmNoteUrl } from '../../apiConfig';
import { FarmNote } from './types';
import { enqueueSuccessSnackbar } from '../../containers/Snackbar/snackbarSlice';
import { isOfflineSelector } from '../../containers/hooks/useOfflineDetector/offlineDetectorSlice';
import { loginSelector } from '../../containers/userFarmSlice';
import { isNetworkError, QueryResult } from '../../util/apiUtils';
import { RootState } from '../store';

type FarmNoteData = {
  note: string;
  is_private: boolean;
};

interface AddFarmNoteReqBody {
  file?: File;
  data: FarmNoteData;
}

interface EditFarmNoteReqBody {
  id: string;
  file?: File;
  data: FarmNoteData & {
    image_url?: null;
  };
}

export const farmNoteApi = api.injectEndpoints({
  endpoints: (build) => ({
    getFarmNotes: build.query<FarmNote[], void>({
      queryFn: async (_, { getState }, __, baseQuery): Promise<QueryResult<FarmNote[]>> => {
        const state = getState() as RootState;
        const isOffline = isOfflineSelector(state);

        // When offline, return cached data directly instead of making a network request.
        // This keeps the query in 'fulfilled' status, which is required for optimistic updates to remain visible in the UI.
        if (isOffline) {
          const existingData = selectFarmNoteResult(state);
          if (existingData.data) {
            return { data: existingData.data };
          }
        }
        return baseQuery({ url: farmNoteUrl, method: 'GET' }) as QueryResult<FarmNote[]>;
      },
      providesTags: ['FarmNote'],
    }),
    addFarmNote: build.mutation<FarmNote, AddFarmNoteReqBody>({
      query: ({ file, data }) => {
        // Mirrors supportTicketApi.ts
        // Must similarly add to non-JSON endpoint keys in apiSlice.ts
        const formData = new FormData();
        if (file) {
          formData.append('_file_', file);
        }
        formData.append('data', JSON.stringify(data));
        return {
          url: farmNoteUrl,
          method: 'POST',
          body: formData,
        };
      },
      async onQueryStarted({ file, data }, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState;
        const userFarm = loginSelector(state);

        const optimisticNote: FarmNote = {
          id: uuidv4(),
          farm_id: userFarm.farm_id!,
          user_id: userFarm.user_id!,
          note: data.note,
          is_private: data.is_private,
          image_url: file ? 'pending' : undefined,
          updated_at: new Date().toISOString(),
          to_sync: true,
        };

        const patchResult = dispatch(
          farmNoteApi.util.updateQueryData('getFarmNotes', undefined, (draft) => {
            draft.unshift(optimisticNote);
          }),
        );

        try {
          await queryFulfilled;
        } catch (error: any) {
          if (isNetworkError(error)) {
            dispatch(enqueueSuccessSnackbar(i18n.t('message:FARM_NOTE.SYNC.ADD.ONLINE')));
          } else {
            // Server error: rollback the optimistic update
            patchResult.undo();
          }
        }
      },
      invalidatesTags: ['FarmNote'],
    }),
    editFarmNote: build.mutation<FarmNote, EditFarmNoteReqBody>({
      query: ({ id, file, data }) => {
        const formData = new FormData();
        if (file) {
          formData.append('_file_', file);
        }
        formData.append('data', JSON.stringify(data));

        return {
          url: `${farmNoteUrl}/${id}`,
          method: 'PATCH',
          body: formData,
        };
      },
      async onQueryStarted({ id, file, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          farmNoteApi.util.updateQueryData('getFarmNotes', undefined, (draft) => {
            const noteIndex = draft.findIndex((note) => note.id === id);
            if (noteIndex !== -1) {
              draft[noteIndex] = {
                ...draft[noteIndex],
                note: data.note,
                is_private: data.is_private,
                image_url: file ? 'pending' : data.image_url ?? draft[noteIndex].image_url,
                updated_at: new Date().toISOString(),
                to_sync: true,
              };
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch (error: any) {
          if (isNetworkError(error)) {
            dispatch(enqueueSuccessSnackbar(i18n.t('message:FARM_NOTE.SYNC.EDIT.ONLINE')));
          } else {
            // Server error: rollback the optimistic update
            patchResult.undo();
          }
        }
      },
      invalidatesTags: ['FarmNote'],
    }),
    deleteFarmNote: build.mutation<void, string>({
      query: (id) => ({
        url: `${farmNoteUrl}/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          farmNoteApi.util.updateQueryData('getFarmNotes', undefined, (draft) => {
            const noteIndex = draft.findIndex((note) => note.id === id);
            if (noteIndex !== -1) {
              draft.splice(noteIndex, 1);
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch (error: any) {
          if (isNetworkError(error)) {
            dispatch(enqueueSuccessSnackbar(i18n.t('message:FARM_NOTE.SYNC.DELETE.ONLINE')));
          } else {
            // Server error: rollback the deletion
            patchResult.undo();
          }
        }
      },
      invalidatesTags: ['FarmNote'],
    }),
  }),
});

export const selectFarmNoteResult = farmNoteApi.endpoints.getFarmNotes.select();

export const {
  useGetFarmNotesQuery,
  useAddFarmNoteMutation,
  useEditFarmNoteMutation,
  useDeleteFarmNoteMutation,
} = farmNoteApi;
