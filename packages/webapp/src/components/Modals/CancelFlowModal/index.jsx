/*
 *  Copyright 2021-2025 LiteFarm.org
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
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';

export default function CancelFlowModal({ dismissModal, handleCancel }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t('CANCEL_FLOW_MODAL.TITLE')}
      contents={[t('CANCEL_FLOW_MODAL.BODY')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button onClick={dismissModal} color={'secondary'} sm>
            {t('CANCEL_FLOW_MODAL.NO_BUTTON')}
          </Button>
          <Button data-cy="cancelFlow-yes" onClick={handleCancel} sm>
            {t('common:CANCEL')}
          </Button>
        </>
      }
      warning
    />
  );
}
