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
import {
  enqueueErrorSnackbar,
  enqueueSuccessSnackbar,
} from '../../containers/Snackbar/snackbarSlice';

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
      query: () => ({
        url: farmNoteUrl,
        method: 'GET',
      }),
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
        try {
          await queryFulfilled;
        } catch (error: any) {
          // Check if this is a network error (FETCH_ERROR) vs server error
          // In RTK Query, network errors result in undefined status or specific error structure
          const isNetworkError = !error.status || error.status === 'FETCH_ERROR';

          if (isNetworkError) {
            // Network failure: inject optimistic note with to_sync flag
            const state = getState() as any;
            const userFarm = state.entitiesReducer.userFarmReducer;

            const optimisticNote: FarmNote = {
              id: uuidv4(),
              farm_id: userFarm.farm_id,
              user_id: userFarm.user_id,
              note: data.note,
              is_private: data.is_private,
              image_url: file ? 'pending' : undefined,
              updated_at: new Date().toISOString(),
              to_sync: true,
            };

            // Patch the getFarmNotes cache with optimistic update
            dispatch(
              farmNoteApi.util.updateQueryData('getFarmNotes', undefined, (draft) => {
                draft.unshift(optimisticNote);
              }),
            );

            // Show offline queue snackbar
            dispatch(enqueueSuccessSnackbar(i18n.t('message:FARM_NOTE.CREATE.SYNC.ONLINE')));
          } else {
            // Server error: show error snackbar (no optimistic update to rollback)
            console.error(error);
            dispatch(enqueueErrorSnackbar(i18n.t('message:FARM_NOTE.CREATE.FAILED')));
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
      invalidatesTags: ['FarmNote'],
    }),
    deleteFarmNote: build.mutation<void, string>({
      query: (id) => ({
        url: `${farmNoteUrl}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FarmNote'],
    }),
  }),
});

export const {
  useGetFarmNotesQuery,
  useAddFarmNoteMutation,
  useEditFarmNoteMutation,
  useDeleteFarmNoteMutation,
} = farmNoteApi;
