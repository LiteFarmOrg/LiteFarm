/*
 *  Copyright 2025 LiteFarm.org
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

import ModalComponent from '../ModalComponent/v2';
import { useTranslation, Trans } from 'react-i18next';
import Button from '../../Form/Button';

interface RemoveProductConfirmationModalProps {
  dismissModal: () => void;
  handleRemove: () => void;
  productName?: string;
}

export default function RemoveProductConfirmationModal({
  dismissModal,
  handleRemove,
  productName,
}: RemoveProductConfirmationModalProps) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      title={t('INVENTORY.REMOVE_CONFIRMATION.TITLE')}
      contents={[
        <Trans
          i18nKey="INVENTORY.REMOVE_CONFIRMATION.BODY"
          values={{ name: productName }}
          components={{ strong: <strong /> }}
        />,
      ]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button onClick={dismissModal} color={'secondary'} type={'button'} sm>
            {t('common:CANCEL')}
          </Button>
          <Button onClick={handleRemove} type={'submit'} sm>
            {t('common:REMOVE')}
          </Button>
        </>
      }
    />
  );
}
