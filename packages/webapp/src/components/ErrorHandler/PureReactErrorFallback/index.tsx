/*
 *  Copyright 2024 LiteFarm.org
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

import { useTranslation, Trans } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import styles from './styles.module.scss';
import { Title, Main } from '../../Typography';
import TextButton from '../../Form/Button/TextButton';
import Background from '../../../assets/images/errorFallback/background.svg?react';
import MobileBackground from '../../../assets/images/errorFallback/background_mobile.svg?react';
import FarmerDesktop from '../../../assets/images/errorFallback/farmer_desktop.svg?react';
import FarmerMobile from '../../../assets/images/errorFallback/farmer_mobile.svg?react';
import RefreshIcon from '../../../assets/images/errorFallback/refresh.svg?react';
import LogoutIcon from '../../../assets/images/errorFallback/logout.svg?react';
import Logo from '../../../assets/images/nav/logo-large.svg?react';
import { SUPPORT_EMAIL } from '../../../util/constants';

interface PureReactErrorFallbackProps {
  handleReload: () => Promise<void>;
  handleLogout: () => void;
}

export const PureReactErrorFallback = ({
  handleReload,
  handleLogout,
}: PureReactErrorFallbackProps) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <div className={styles.container}>
      {isDesktop ? (
        <Background className={styles.background} />
      ) : (
        <MobileBackground className={styles.background} />
      )}
      <Logo className={styles.logo} />
      <div className={styles.textContainer}>
        <Title className={styles.title}>{t('ERROR_FALLBACK.TITLE')}</Title>
        <Main className={styles.subtitle}>{t('ERROR_FALLBACK.SUBTITLE')}</Main>
        <Main className={styles.mainText}>{t('ERROR_FALLBACK.MAIN')}</Main>
        <div className={styles.buttonContainer}>
          <TextButton className={styles.iconLink} onClick={handleReload}>
            <RefreshIcon className={styles.icon} />
            {t('ERROR_FALLBACK.RELOAD')}
          </TextButton>
          <Main className={styles.or}>{t('common:OR')}</Main>
          <TextButton className={styles.iconLink} onClick={handleLogout}>
            <LogoutIcon className={styles.icon} />
            {t('PROFILE_FLOATER.LOG_OUT')}
          </TextButton>
        </div>
        <Main className={styles.supportText}>
          <Trans
            i18nKey="ERROR_FALLBACK.CONTACT"
            values={{ supportEmail: SUPPORT_EMAIL }}
            components={{
              1: <a href={`mailto:${SUPPORT_EMAIL}`} className={styles.email} />,
            }}
          />
        </Main>
      </div>
      {isDesktop ? (
        <FarmerDesktop className={styles.farmerDesktop} />
      ) : (
        <FarmerMobile className={styles.farmerMobile} />
      )}
    </div>
  );
};
