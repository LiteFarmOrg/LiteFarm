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

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { userFarmSelector, userDisplayNameMapSelector } from '../userFarmSlice';
import { useDeleteFarmNoteMutation, useGetFarmNotesQuery } from '../../store/api/farmNoteApi';
import {
  useGetFarmNotesReadQuery,
  useMarkFarmNotesReadMutation,
} from '../../store/api/farmNotesReadApi';
import type { FarmNote } from '../../store/api/types';
import { ReactComponent as MessageTextSquareIcon } from '../../assets/images/message-text-square-02.svg';
import FarmNoteFormContainer from './FarmNoteForm';
import FarmNoteList from '../../components/FarmNotes/FarmNoteList/';
import FarmNotesFloatingButton from '../../components/FarmNotes/FarmNotesFloatingButton/';
import DeleteFarmNoteModal from '../../components/Modals/DeleteFarmNoteModal';
import Drawer, { DesktopDrawerVariants } from '../../components/Drawer';
import ImageLightbox from '../../components/ImageLightbox';
import styles from './styles.module.scss';
import type { UserFarm } from '../../types';
import { isNetworkError } from '../../util/apiUtils';

type FormState = null | { mode: 'add' } | { mode: 'edit'; note: FarmNote };

export default function FarmNotes() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userFarm = useSelector(userFarmSelector) as UserFarm;
  const userDisplayNameMap = useSelector(userDisplayNameMapSelector);

  const { data: farmNotes } = useGetFarmNotesQuery();
  const [deleteFarmNote] = useDeleteFarmNoteMutation();

  const { data: farmNotesRead } = useGetFarmNotesReadQuery();
  const [markFarmNotesRead] = useMarkFarmNotesReadMutation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<FarmNote | null>(null);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
    markFarmNotesRead();
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setFormState(null);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) {
      return;
    }
    try {
      await deleteFarmNote(noteToDelete.id).unwrap();
      dispatch(enqueueSuccessSnackbar(t('message:FARM_NOTE.SUCCESS.DELETE')));
    } catch (error) {
      if (!isNetworkError(error)) {
        console.error(error);
        dispatch(enqueueErrorSnackbar(t('message:FARM_NOTE.ERROR.DELETE')));
      }
      // Don't show error snackbar for network errors since it's handled in the api slice
    }
    setNoteToDelete(null);
  };

  const isFormOpen = formState !== null;
  const isEditState = formState?.mode === 'edit';
  const formTitle = isEditState ? t('FARM_NOTE.EDIT_NOTE') : t('FARM_NOTE.NEW_NOTE');

  const lastReadAt = farmNotesRead?.read_through;
  const hasUnread = farmNotes?.some(
    (note) =>
      note.user_id !== userFarm?.user_id &&
      (!lastReadAt || new Date(note.updated_at) > new Date(lastReadAt)),
  );

  return (
    <>
      <div className={styles.fab}>
        <FarmNotesFloatingButton onClick={handleOpenDrawer} hasUnread={!!hasUnread} />
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={
          isFormOpen ? (
            formTitle
          ) : (
            <span className={styles.listTitle}>
              <MessageTextSquareIcon />
              {t('FARM_NOTE.FARM_NOTES')}
            </span>
          )
        }
        desktopVariant={DesktopDrawerVariants.SIDE_DRAWER}
        fullHeight
        addBackdrop={false}
        classes={{ desktopSideDrawerContainer: styles.sideDrawerContainer }}
      >
        {isFormOpen ? (
          <FarmNoteFormContainer
            note={isEditState ? formState.note : undefined}
            onClose={() => setFormState(null)}
          />
        ) : (
          <FarmNoteList
            notes={farmNotes || []}
            userDisplayNameMap={userDisplayNameMap}
            currentUserId={userFarm?.user_id ?? ''}
            onAddNote={() => setFormState({ mode: 'add' })}
            onEditNote={(note) => setFormState({ mode: 'edit', note })}
            onDeleteNote={setNoteToDelete}
            onImageClick={setLightboxSrc}
          />
        )}
      </Drawer>

      <ImageLightbox
        src={lightboxSrc || ''}
        open={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />

      {noteToDelete && (
        <DeleteFarmNoteModal
          dismissModal={() => setNoteToDelete(null)}
          handleDelete={handleConfirmDelete}
        />
      )}
    </>
  );
}
