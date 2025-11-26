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

import { TFunction, useTranslation } from 'react-i18next';
import clsx from 'clsx';
import i18n from '../../../../../locales/i18n';
import { useGetMarketDirectoryPartnersQuery } from '../../../../../store/api/marketDirectoryPartnersApi';
import {
  PureMarketDirectoryTile,
  PureMarketDirectoryTileProps,
} from '../../../../../components/MarketDirectoryTile';
import { MarketDirectoryPartner } from '../../../../../store/api/types';
import OFNLogo from '../../../../../assets/images/marketDirectory/logo-ofn-global.png';
import styles from './styles.module.scss';

interface MarketDirectoryConsentProps {
  disabled: boolean;
}

const LogoAndCountry = ({ country }: { country: string }) => {
  return (
    <div className={styles.logoAndCountry}>
      <img src={OFNLogo} width="143" height="50" />
      <span>{country}</span>
    </div>
  );
};

const PARTNERS_INFO: {
  [key: MarketDirectoryPartner['key']]: Pick<
    PureMarketDirectoryTileProps,
    'name' | 'description' | 'website' | 'termsUrl' | 'logo'
  >;
} = {
  OFN_CANADA: {
    name: 'OFN Canada',
    description: i18n.t('MARKET_DIRECTORY.PARTNERS.OFN_DESCRIPTION'),
    website: 'https://openfoodnetwork.ca/',
    termsUrl: 'https://openfoodnetwork.ca/', // TODO: Update
    logo: <LogoAndCountry country="Canada" />,
  },
};

const MarketDirectoryConsent = ({ disabled }: MarketDirectoryConsentProps) => {
  const { t } = useTranslation();
  const { data: marketDirectoryPartners = [] } = useGetMarketDirectoryPartnersQuery();

  return (
    <div className={styles.consentContainer}>
      <div className={styles.consent}>
        <h3 className={styles.consentTitle}>{t('MARKET_DIRECTORY.CONSENT.TITLE')}</h3>
        {disabled && <WarningBanner t={t} />}
      </div>
      <div className={styles.marketDirectories}>
        <h3 className={styles.consentTitle}>{t('MARKET_DIRECTORY.MARKET_DIRECTORIES')}</h3>
        <p className={styles.lead}>{t('MARKET_DIRECTORY.WHERE_TO_BE_FEATURED')}</p>
        <div className={clsx(styles.marketTiles)}>
          {marketDirectoryPartners.map(({ key }) => {
            return (
              <PureMarketDirectoryTile
                key={key}
                {...PARTNERS_INFO[key]}
                hasConsent={false}
                isReadOnly={disabled}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketDirectoryConsent;

const WarningBanner = ({ t }: { t: TFunction }) => {
  return (
    <div className={styles.warningBanner}>
      <p>{t('MARKET_DIRECTORY.CONSENT.ALMOST_READY')}</p>
    </div>
  );
};
