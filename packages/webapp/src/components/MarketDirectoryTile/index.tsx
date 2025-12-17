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

import { ReactNode } from 'react';
import clsx from 'clsx';
import { useTranslation, Trans } from 'react-i18next';
import { ReactComponent as CheckIcon } from '../../assets/images/check-circle2.svg';
import Switch from '../Form/Switch';
import Button from '../Form/Button';
import { ReactComponent as MessageSquareIcon } from '../../assets/images/message-square-02.svg';
import styles from './styles.module.scss';

export interface PureMarketDirectoryTileProps {
  name: string;
  description: string;
  website: string;
  termsUrl: string;
  logo: ReactNode;
  hasConsent: boolean;
  onConsentChange?: () => void;
  isReadOnly?: boolean;
  classNames?: { container?: string };
}

export const PureMarketDirectoryTile = ({
  name,
  description,
  website,
  termsUrl,
  logo,
  hasConsent,
  onConsentChange,
  classNames,
  isReadOnly = false,
}: PureMarketDirectoryTileProps) => {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <div className={clsx(styles.container, hasConsent && styles.isChecked, classNames?.container)}>
      {hasConsent && <CheckIcon className={styles.checkIcon} />}
      <a className={styles.logo} href={website} target="_blank" rel="noreferrer">
        {logo}
      </a>
      <p className={styles.description}>{description}</p>
      <p className={styles.message}>
        <Trans i18nKey="MARKET_DIRECTORY.AGREE_WITH_TERMS">
          By sharing your data with {{ partner: name }}, you agree with their
          <a className={styles.termsLink} href={termsUrl} target="_blank" rel="noreferrer">
            Terms ⬈
          </a>
        </Trans>
      </p>
      <Switch
        classes={{
          container: styles.switchContainer,
          track: clsx(styles.track, isReadOnly && styles.readOnly),
        }}
        leftLabel={t('common:SHARE')}
        onChange={onConsentChange}
        checked={hasConsent}
        disabled={isReadOnly}
      />
    </div>
  );
};

export const MarketplaceSuggestionTile = ({
  onClick,
  noPartner,
}: {
  onClick: () => void;
  noPartner: boolean;
}) => {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <div className={clsx(styles.container, styles.marketplaceSuggestionTile)}>
      {noPartner && (
        <p>
          <b>{t('MARKET_DIRECTORY.NO_PARTNER')}</b>
        </p>
      )}
      <p>
        <Trans i18nKey="MARKET_DIRECTORY.KNOW_A_MARKETPLACE" components={{ br: <br /> }} />
      </p>
      <Button sm color="secondary" onClick={onClick} className={styles.suggestButton}>
        <MessageSquareIcon />
        {t('common:SUGGEST')}
      </Button>
    </div>
  );
};
