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

import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v3';
import Button from '../../Form/Button';

interface DeleteFarmNoteModalProps {
  dismissModal: () => void;
  handleDelete: () => void;
}

export default function DeleteFarmNoteModal({
  dismissModal,
  handleDelete,
}: DeleteFarmNoteModalProps) {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <ModalComponent
      title={t('FARM_NOTE.DELETE_CONFIRMATION.TITLE')}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button onClick={dismissModal} color="secondary-cta" sm>
            {t('common:CANCEL')}
          </Button>
          <Button onClick={handleDelete} color="primary" sm>
            {t('common:DELETE')}
          </Button>
        </>
      }
    >
      {t('FARM_NOTE.DELETE_CONFIRMATION.BODY')}
    </ModalComponent>
  );
}
