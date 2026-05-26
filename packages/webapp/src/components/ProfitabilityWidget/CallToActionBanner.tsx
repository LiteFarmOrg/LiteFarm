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
import styles from './styles.module.scss';

export interface CallToActionBannerProps {
  message: string;
  ctaLabel: string;
  onAddTransactions: () => void;
}

const CallToActionBanner = ({ message, ctaLabel, onAddTransactions }: CallToActionBannerProps) => {
  return (
    <div className={styles.ctaBanner}>
      <span className={styles.ctaBannerText}>{message}</span>
      <button type="button" className={styles.ctaBannerButton} onClick={onAddTransactions}>
        <AddCircleOutlineIcon fontSize="small" />
        {ctaLabel}
      </button>
    </div>
  );
};

export default CallToActionBanner;
