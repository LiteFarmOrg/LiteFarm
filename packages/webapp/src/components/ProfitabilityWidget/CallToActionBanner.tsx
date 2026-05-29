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

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useTranslation } from 'react-i18next';
import Button from '../Form/Button';
import { CtaVariant } from './constants';
import styles from './styles.module.scss';

export interface CallToActionBannerProps {
  variant: CtaVariant;
  onAddTransactions: () => void;
}

const CallToActionBanner = ({ variant, onAddTransactions }: CallToActionBannerProps) => {
  const { t } = useTranslation('profitability');

  const messageByVariant: Record<CtaVariant, string> = {
    noTransactions: t('CTA_BANNER.NO_TRANSACTIONS'),
    default: t('CTA_BANNER.DEFAULT'),
    noAttributions: t('CTA_BANNER.NO_ATTRIBUTIONS'),
  };

  return (
    <div className={styles.ctaBanner}>
      <span className={styles.ctaBannerText}>{messageByVariant[variant]}</span>
      <Button
        type="button"
        color="secondary-2"
        className={styles.ctaBannerAction}
        onClick={onAddTransactions}
        sm
      >
        <AddCircleOutlineIcon fontSize="small" />
        {t('CTA_BANNER.CTA')}
      </Button>
    </div>
  );
};

export default CallToActionBanner;
