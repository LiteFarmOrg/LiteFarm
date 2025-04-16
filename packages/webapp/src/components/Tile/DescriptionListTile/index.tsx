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

import { CSSProperties, ReactNode } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

export type TileData = { label: string; data: ReactNode; iconURL?: string };

export enum LabelSize {
  SMALL = 'small',
}

interface DescriptionListTileProps extends TileData {
  hideLabel?: boolean;
  labelSize?: LabelSize;
  className?: string;
}

const DescriptionListTile = ({
  label,
  data,
  hideLabel,
  labelSize,
  iconURL,
  className,
}: DescriptionListTileProps) => {
  return (
    <dl
      key={label}
      className={clsx(styles.dlTile, iconURL && styles.hasIcon, className)}
      style={{ '--icon': `url(${iconURL})` } as CSSProperties}
    >
      <dt className={clsx(hideLabel && styles.hideLabel, styles[labelSize || ''])}>{label}</dt>
      <dd>{data}</dd>
    </dl>
  );
};

export default DescriptionListTile;
