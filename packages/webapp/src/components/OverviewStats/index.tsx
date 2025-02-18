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

import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import styles from './styles.module.scss';

export type OverviewStatsProps = {
  stats: Record<string, number>;
  translationMappings: { key: string; translationKey: string }[];
  FormattedLabelComponent?: ({ statKey, label }: { statKey: string; label: string }) => JSX.Element;
  isCompact?: boolean;
};

const OverviewStats = ({
  stats,
  translationMappings,
  FormattedLabelComponent,
  isCompact,
}: OverviewStatsProps) => {
  const { t } = useTranslation();

  return (
    <div className={clsx(styles.wrapper, isCompact ? styles.isCompact : '')}>
      {translationMappings.map(({ key, translationKey }) => {
        const label = t(translationKey);
        const count = key in stats ? stats[key] : 0;

        return (
          <div key={key} className={styles.tile}>
            <span className={styles.category}>
              {FormattedLabelComponent ? (
                <FormattedLabelComponent statKey={key} label={label} />
              ) : (
                label
              )}
            </span>
            <span className={styles.count}>{count}</span>
          </div>
        );
      })}
    </div>
  );
};

export default OverviewStats;
