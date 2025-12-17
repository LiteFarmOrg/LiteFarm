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

import i18n from '../../../../../locales/i18n';
import { PureMarketDirectoryTileProps } from '../../../../../components/MarketDirectoryTile';
import { MarketDirectoryPartner } from '../../../../../store/api/types';
import OFNLogo from '../../../../../assets/images/marketDirectory/logo-ofn-global.svg';
import styles from './styles.module.scss';

const LogoAndCountry = ({ country }: { country: string }) => {
  return (
    <div className={styles.logoAndCountry}>
      <img src={OFNLogo} width="143" height="50" />
      <span>{country}</span>
    </div>
  );
};

export const PARTNERS_INFO: {
  [key: MarketDirectoryPartner['key']]: Pick<
    PureMarketDirectoryTileProps,
    'name' | 'description' | 'website' | 'termsUrl' | 'logo'
  >;
} = {
  OFN_CANADA: {
    name: 'OFN Canada',
    description: i18n.t('MARKET_DIRECTORY.PARTNERS.OFN_DESCRIPTION'),
    website: 'https://openfoodnetwork.ca/',
    termsUrl: 'https://drive.google.com/file/d/1_CDmmM2Aq-hxyJG2c-1iPyfB0gynXBBK/view?usp=sharing',
    logo: <LogoAndCountry country="Canada" />,
  },
};
