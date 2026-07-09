/*
 *  Copyright 2026 LiteFarm.org
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
import { useTranslation } from 'react-i18next';
import { ReactComponent as InfoCircleIcon } from '../../assets/images/info-circle.svg';
import styles from './index.module.scss';

interface CertificationBannerProps {
  className?: string;
}

export default function CertificationBanner({ className }: CertificationBannerProps) {
  const { t } = useTranslation('translation');

  return (
    <div className={clsx(styles.banner, className)}>
      <InfoCircleIcon className={styles.bannerIcon} aria-hidden />
      <p className={styles.bannerText}>{t('CERTIFICATION.BANNER')}</p>
    </div>
  );
}
