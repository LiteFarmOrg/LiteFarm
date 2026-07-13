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
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { ReactComponent as ExportIcon } from '../../assets/images/finance/Report-icn.svg';

import styles from './index.module.scss';

interface CertificationBannerProps {
  variant?: 'info' | 'success';
  marketDirectoryProfileLink?: string;
  className?: string;
}

export default function CertificationBanner({
  variant = 'info',
  marketDirectoryProfileLink,
  className,
}: CertificationBannerProps) {
  const { t } = useTranslation('translation');
  const isSuccess = variant === 'success';

  return (
    <div className={clsx(styles.banner, className)}>
      <AiOutlineInfoCircle className={styles.bannerIcon} aria-hidden />
      <p className={styles.bannerText}>
        <span>
          <Trans i18nKey={isSuccess ? 'CERTIFICATION.BANNER_SAVED' : 'CERTIFICATION.BANNER'} />
        </span>
        {isSuccess && marketDirectoryProfileLink && (
          <Link
            to={marketDirectoryProfileLink}
            className={styles.bannerLinkIcon}
            aria-label={t('CERTIFICATION.VIEW_MARKET_DIRECTORY_PROFILE')}
          >
            <ExportIcon />
          </Link>
        )}
      </p>
    </div>
  );
}
