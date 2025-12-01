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

import { TFunction, Trans, useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useGetMarketDirectoryPartnersQuery } from '../../../../../store/api/marketDirectoryPartnersApi';
import {
  PureMarketDirectoryTile,
  MarketplaceSuggestionTile,
} from '../../../../../components/MarketDirectoryTile';
import Checkbox from '../../../../../components/Form/Checkbox';
import DataSummary from '../DataSummary';
import { PARTNERS_INFO } from './partners';
import { MarketDirectoryInfo } from '../../../../../store/api/types';
import styles from './styles.module.scss';

interface MarketDirectoryConsentProps {
  disabled: boolean;
  setFeedbackSurveyOpen: () => void;
  marketDirectoryInfo?: MarketDirectoryInfo;
}

const MarketDirectoryConsent = ({
  disabled,
  setFeedbackSurveyOpen,
  marketDirectoryInfo,
}: MarketDirectoryConsentProps) => {
  const { t } = useTranslation();
  const { data: marketDirectoryPartners = [] } =
    useGetMarketDirectoryPartnersQuery('?filter=country');

  return (
    <div className={styles.consentContainer}>
      <div className={styles.consent}>
        <h3 className={styles.sectionTitle}>{t('MARKET_DIRECTORY.CONSENT.TITLE')}</h3>
        {disabled && <WarningBanner t={t} />}
        <DataSummary marketDirectoryInfo={marketDirectoryInfo} />
        <div className={clsx(styles.consentMain, disabled && styles.disabled)}>
          <p>
            <Trans
              i18nKey="MARKET_DIRECTORY.CONSENT.CONSENT_TO_SHARE_INFORMATION"
              components={{ br: <br /> }}
            />
          </p>
          <Checkbox
            classNames={{ container: styles.checkbox, label: styles.label }}
            label={t('MARKET_DIRECTORY.CONSENT.I_AGREE')}
          />
        </div>
      </div>
      <div className={styles.marketDirectories}>
        <h3 className={styles.sectionTitle}>{t('MARKET_DIRECTORY.MARKET_DIRECTORIES')}</h3>
        <p className={styles.lead}>{t('MARKET_DIRECTORY.WHERE_TO_BE_FEATURED')}</p>
        <div className={clsx(styles.marketTiles)}>
          {marketDirectoryPartners.map(({ key }) => {
            return (
              <PureMarketDirectoryTile
                key={key}
                {...PARTNERS_INFO[key]}
                hasConsent={false} // TODO: LF-4992
                onConsentChange={undefined} // TODO: LF-4992
                isReadOnly={disabled}
              />
            );
          })}
          <MarketplaceSuggestionTile onClick={setFeedbackSurveyOpen} />
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
