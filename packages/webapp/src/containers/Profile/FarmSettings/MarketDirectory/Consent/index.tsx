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
import styles from './styles.module.scss';

interface MarketDirectoryConsentProps {
  disabled: boolean;
}

const MarketDirectoryConsent = ({ disabled }: MarketDirectoryConsentProps) => {
  const { t } = useTranslation();
  // LF-5016 -- RTK Query setup for Market Directories here

  return (
    <div className={styles.consentContainer}>
      <h3 className={styles.consentTitle}>{t('MARKET_DIRECTORY.CONSENT.TITLE')}</h3>
      {disabled && <WarningBanner t={t} />}
      {/* LF-5016 -- replace with actual Pure Component */}
      <div className={clsx(styles.marketTiles, disabled && styles.disabled)}>
        <div />
        <div />
        <div />
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
