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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';

interface NoSoilAmendmentProductsModalProps {
  dismissModal: () => void;
  goToInventory: () => void;
}

export function NoSoilAmendmentProductsModal({
  dismissModal,
  goToInventory,
}: NoSoilAmendmentProductsModalProps) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      title={t('ADD_TASK.NO_SOIL_AMENDMENT_PRODUCTS')}
      contents={[t('ADD_TASK.NEED_SOIL_AMENDMENT_PRODUCTS')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button
            data-cy="tasks-noSoilAmendmentProductsCancel"
            onClick={dismissModal}
            color={'secondary'}
            type={'button'}
            sm
          >
            {t('common:GO_BACK')}
          </Button>
          <Button
            data-cy="tasks-noSoilAmendmentProductsContinue"
            onClick={goToInventory}
            type={'submit'}
            sm
          >
            {t('ADD_TASK.GO_TO_INVENTORY')}
          </Button>
        </>
      }
    ></ModalComponent>
  );
}
