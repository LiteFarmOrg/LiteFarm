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

import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';

export default function UnableToRemoveProductModal({
  dismissModal,
  productName,
}: {
  dismissModal: () => void;
  productName: string;
}) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t('INVENTORY.UNABLE_TO_REMOVE.TITLE')}
      contents={[t('INVENTORY.UNABLE_TO_REMOVE.BODY', { name: productName })]}
      dismissModal={dismissModal}
      error
    />
  );
}
