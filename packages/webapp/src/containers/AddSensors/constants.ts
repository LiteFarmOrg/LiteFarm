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

import EsciLogo from '../../assets/images/partners/esci_logo.png';
import i18n from '../../locales/i18n';

export const PARTNERS = {
  ESCI: {
    id: 1,
    name: i18n.t('SENSOR.ESCI.NAME'),
    url: 'www.esci.io',
    logoPath: EsciLogo,
    shortName: i18n.t('SENSOR.ESCI.SHORT_NAME'),
  },
};

export const partnerIds = Object.values(PARTNERS).map(({ id }) => id);
