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

interface DeleteConfirmationModalProps {
  subject: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  subject,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <ModalComponent
      title={t('DELETE_CONFIRMATION.TITLE')}
      dismissModal={onClose}
      buttonGroup={
        <>
          <Button onClick={onClose} color="secondary-cta" sm disabled={isLoading}>
            {t('common:CANCEL')}
          </Button>
          <Button onClick={onConfirm} color="primary" sm disabled={isLoading}>
            {t('common:DELETE')}
          </Button>
        </>
      }
    >
      {t('DELETE_CONFIRMATION.BODY', { subject })}
    </ModalComponent>
  );
}
