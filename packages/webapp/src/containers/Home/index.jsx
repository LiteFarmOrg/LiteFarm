import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSeason } from './utils/season';
import WeatherBoard from '../../containers/WeatherBoard';
import PureHome from '../../components/Home';
import { userFarmSelector, userDisplayNameMapSelector } from '../userFarmSlice';
import { useTranslation } from 'react-i18next';
import FarmSwitchOutro from '../FarmSwitchOutro';
import {
  chooseFarmFlowSelector,
  endExportModal,
  endSwitchFarmModal,
  switchFarmSelector,
} from '../ChooseFarm/chooseFarmFlowSlice';

import PreparingExportModal from '../../components/Modals/PreparingExportModal';
import { getAlert } from '../Navigation/Alert/saga.js';
import useMediaWithAuthentication from '../hooks/useMediaWithAuthentication';
import { useGetSensorsQuery } from '../../store/api/apiSlice';
import { useDeleteFarmNoteMutation, useGetFarmNotesQuery } from '../../store/api/farmNoteApi';
import {
  useGetFarmNotesReadQuery,
  useMarkFarmNotesReadMutation,
} from '../../store/api/farmNotesReadApi';
import FarmNoteFormContainer from '../FarmNotes/FarmNoteForm';
import FarmNoteList from '../../components/FarmNotes/FarmNoteList/';
import FarmNotesFloatingButton from '../../components/FarmNotes/FarmNotesFloatingButton/';
import Drawer, { DesktopDrawerVariants } from '../../components/Drawer';
import ImageLightbox from '../../components/ImageLightbox';
import styles from './styles.module.scss';

export default function Home() {
  const { t } = useTranslation();
  const userFarm = useSelector(userFarmSelector);
  const userDisplayNameMap = useSelector(userDisplayNameMapSelector);
  const defaultImageUrl = getSeason(userFarm?.grid_points?.lat);
  const { showSpotLight, showExportModal } = useSelector(chooseFarmFlowSelector);
  const dispatch = useDispatch();
  const showSwitchFarmModal = useSelector(switchFarmSelector);
  const dismissPopup = () => dispatch(endSwitchFarmModal(userFarm.farm_id));
  const dismissExportModal = () => dispatch(endExportModal(userFarm.farm_id));
  const { mediaUrl: authenticatedImageUrl, isLoading } = useMediaWithAuthentication({
    fileUrls: [userFarm.farm_image_url],
  });

  const { data: farmNotes } = useGetFarmNotesQuery();
  const [deleteFarmNote] = useDeleteFarmNoteMutation();

  const { data: farmNotesRead } = useGetFarmNotesReadQuery();
  const [markFarmNotesRead] = useMarkFarmNotesReadMutation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // formState: null = list view, 'add' = new note form, { mode: 'edit', note } = edit form
  const [formState, setFormState] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
    markFarmNotesRead();
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setFormState(null);
  };

  const handleDeleteFarmNote = async (note) => {
    try {
      await deleteFarmNote(note.id).unwrap();
    } catch (error) {
      console.error('Failed to delete farm note:', error);
    }
  };

  const { refetch: refetchSensors } = useGetSensorsQuery();

  useEffect(() => {
    refetchSensors();
    dispatch(getAlert());
  }, []);

  const isFormOpen = formState === 'add' || formState?.mode === 'edit';
  const formTitle =
    formState?.mode === 'edit' ? t('FARM_NOTE.EDIT_NOTE') : t('FARM_NOTE.ADD_A_NOTE');

  const lastReadAt = farmNotesRead?.last_read_at;
  const hasUnread = farmNotes?.some(
    (note) =>
      note.user_id !== userFarm?.user_id &&
      (!lastReadAt || new Date(note.updated_at) > new Date(lastReadAt)),
  );

  return (
    <PureHome
      greeting={t('HOME.GREETING')}
      first_name={userFarm?.first_name}
      imgUrl={authenticatedImageUrl || (isLoading ? '' : defaultImageUrl)}
    >
      <div className={styles.fab}>
        <FarmNotesFloatingButton onClick={handleOpenDrawer} hasUnread={!!hasUnread} />
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={isFormOpen ? formTitle : t('FARM_NOTE.FARM_NOTES')}
        desktopVariant={DesktopDrawerVariants.SIDE_DRAWER}
        fullHeight
        addBackdrop={false}
        classes={{ desktopSideDrawerContainer: styles.sideDrawerContainer }}
      >
        {isFormOpen ? (
          <FarmNoteFormContainer
            key={formState?.mode === 'edit' ? formState.note.id : 'add'}
            note={formState?.mode === 'edit' ? formState.note : undefined}
            onSuccess={() => setFormState(null)}
            onCancel={() => setFormState(null)}
          />
        ) : (
          <FarmNoteList
            notes={farmNotes || []}
            userDisplayNameMap={userDisplayNameMap}
            currentUserId={userFarm?.user_id}
            onAddNote={() => setFormState('add')}
            onEditNote={(note) => setFormState({ mode: 'edit', note })}
            onDeleteNote={handleDeleteFarmNote}
            onImageClick={(src) => setLightboxSrc(src)}
          />
        )}
      </Drawer>

      <ImageLightbox
        src={lightboxSrc || ''}
        open={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />

      {userFarm ? <WeatherBoard /> : null}
      {showSwitchFarmModal && !showSpotLight && <FarmSwitchOutro onFinish={dismissPopup} />}

      {showExportModal && <PreparingExportModal dismissModal={() => dismissExportModal(false)} />}
    </PureHome>
  );
}
