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
import styles from './styles.module.scss';
import clsx from 'clsx';

export type TileData = { label: string; data: ReactNode; hideLabel?: boolean };

type WeatherKPIProps = { data: TileData[]; className?: string };

const WeatherKPI = ({ data, className }: WeatherKPIProps) => {
  return (
    <div className={clsx(styles.weatherKPI, className)}>
      {data.map(({ label, data, hideLabel }) => {
        return (
          <dl key={label}>
            <dt className={hideLabel ? styles.hideLabel : ''}>{label}</dt>
            <dd>{data}</dd>
          </dl>
        );
      })}
    </div>
  );
};

export default WeatherKPI;
