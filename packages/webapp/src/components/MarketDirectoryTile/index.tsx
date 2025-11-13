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

import clsx from 'clsx';
import { useTranslation, Trans } from 'react-i18next';
import { ReactComponent as CheckIcon } from '../../assets/images/check-circle2.svg';
import Switch from '../Form/Switch';
import styles from './styles.module.scss';

export interface PureMarketDirectoryTileProps {
  name: string;
  description: string;
  termsUrl: string;
  imgSrc: string;
  isChecked: boolean;
  hasConsent: boolean;
  onConsentChange?: () => void;
  isReadOnly?: boolean;
  classNames?: { container?: string };
}

export const PureMarketDirectoryTile = ({
  name,
  description,
  termsUrl,
  imgSrc,
  isChecked,
  hasConsent,
  onConsentChange,
  classNames,
  isReadOnly = false,
}: PureMarketDirectoryTileProps) => {
  const { t } = useTranslation(['trslation', 'common']);

  return (
    <div className={clsx(styles.container, isChecked && styles.isChecked, classNames?.container)}>
      {isChecked && <CheckIcon className={styles.checkIcon} />}
      {/*  TODO: LF-5016 Adjust width */}
      <img src={imgSrc} alt={name} width="100%" height="50px" className={styles.logo} />
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
