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

import { useTranslation } from 'react-i18next';
import { frostThresholdLabel, Measurement } from '../../../containers/WeatherForecast/selectors';
import styles from './styles.module.scss';

interface FrostBannerProps {
  measurement: Measurement;
}

const FrostBanner = ({ measurement }: FrostBannerProps) => {
  const { t } = useTranslation();
  return (
    <div className={styles.banner} role="status">
      {t('WEATHER.FROST_EXPECTED', {
        threshold: frostThresholdLabel(measurement),
        interpolation: { escapeValue: false },
      })}
    </div>
  );
};

export default FrostBanner;
