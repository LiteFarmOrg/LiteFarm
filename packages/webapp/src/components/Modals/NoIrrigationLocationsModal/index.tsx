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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';

interface NoIrrigationLocationsModalProps {
  dismissModal: () => void;
  goToMap: () => void;
  isAdmin: boolean;
}

export function NoIrrigationLocationsModal({
  dismissModal,
  goToMap,
  isAdmin,
}: NoIrrigationLocationsModalProps) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      title={t('ADD_TASK.NO_IRRIGATION_LOCATIONS')}
      contents={[
        isAdmin
          ? t('ADD_TASK.NEED_IRRIGATION_LOCATION')
          : t('ADD_TASK.NEED_IRRIGATION_LOCATION_WORKER'),
      ]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button onClick={dismissModal} color={'secondary'} type={'button'} sm>
            {isAdmin ? t('common:CANCEL') : t('common:GO_BACK')}
          </Button>
          {isAdmin && (
            <Button onClick={goToMap} type={'submit'} sm>
              {t('LOCATION_CREATION.CREATE_BUTTON')}
            </Button>
          )}
        </>
      }
    ></ModalComponent>
  );
}
