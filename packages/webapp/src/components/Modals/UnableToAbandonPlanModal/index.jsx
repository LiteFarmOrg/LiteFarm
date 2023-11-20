/*
 *  Copyright (c) 2023 LiteFarm.org
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

export default function UnableToAbandonPlanModal({ dismissModal }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t('MANAGEMENT_PLAN.ABANDON.CANT_ABANDON_COMPLETED')}
      contents={[t('MANAGEMENT_PLAN.ABANDON.CANT_ABANDON_CONCURRENT_USER')]}
      dismissModal={dismissModal}
      error
    />
  );
}
