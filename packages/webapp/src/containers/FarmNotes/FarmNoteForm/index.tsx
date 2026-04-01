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

import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAddFarmNoteMutation, useEditFarmNoteMutation } from '../../../store/api/farmNoteApi';
import PureFarmNoteForm, {
  type FarmNoteFormValues,
} from '../../../components/FarmNotes/FarmNoteForm';
import type { FarmNote } from '../../../store/api/types';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';

interface FarmNoteFormContainerProps {
  note?: FarmNote;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FarmNoteFormContainer({
  note,
  onSuccess,
  onCancel,
}: FarmNoteFormContainerProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [addFarmNote] = useAddFarmNoteMutation();
  const [editFarmNote] = useEditFarmNoteMutation();

  const isEditMode = !!note;

  const defaultValues = isEditMode
    ? {
        note: note.note,
        is_private: note.is_private,
        image_url: note.image_url || undefined,
      }
    : undefined;

  const handleSubmit = async (data: FarmNoteFormValues, imageFile: File | null | undefined) => {
    try {
      if (isEditMode) {
        await editFarmNote({
          id: note.id,
          file: imageFile || undefined,
          data: {
            ...data,
            ...(imageFile === null && note.image_url ? { image_url: null } : {}),
          },
        }).unwrap();
      } else {
        await addFarmNote({
          file: imageFile || undefined,
          data,
        }).unwrap();
      }
      dispatch(
        enqueueSuccessSnackbar(
          t(isEditMode ? 'message:FARM_NOTE.SUCCESS.EDIT' : 'message:FARM_NOTE.SUCCESS.ADD'),
        ),
      );
      onSuccess();
    } catch (error) {
      console.error(error);
      dispatch(
        enqueueErrorSnackbar(
          t(isEditMode ? 'message:FARM_NOTE.ERROR.EDIT' : 'message:FARM_NOTE.ERROR.ADD'),
        ),
      );
    }
  };

  return (
    <PureFarmNoteForm defaultValues={defaultValues} onSubmit={handleSubmit} onCancel={onCancel} />
  );
}
