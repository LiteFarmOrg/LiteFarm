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
import clsx from 'clsx';
import styles from './styles.module.scss';

export type TileData = { label: string; data: ReactNode; iconURL?: string };

export enum LabelSize {
  SMALL = 'small',
}

interface DescriptionListTileProps extends TileData {
  hideLabel?: boolean;
  labelSize?: LabelSize;
  className?: string;
}

export const DescriptionListTile = ({
  label,
  data,
  hideLabel,
  labelSize,
  iconURL,
  className,
}: DescriptionListTileProps) => {
  return (
    <div
      className={clsx(styles.dlTile, iconURL && styles.hasIcon, className)}
      style={iconURL ? ({ '--icon': `url(${iconURL})` } as CSSProperties) : undefined}
    >
      <dt className={clsx(hideLabel && styles.hideLabel, styles[labelSize || ''])}>{label}</dt>
      <dd>{data}</dd>
    </div>
  );
};

interface DescriptionListProps {
  descriptionListTilesProps: DescriptionListTileProps[];
  className?: string;
}

const DescriptionList = ({ descriptionListTilesProps, className }: DescriptionListProps) => {
  return (
    <dl className={className}>
      {descriptionListTilesProps.map((tileProps) => (
        <DescriptionListTile {...tileProps} key={tileProps.label} />
      ))}
    </dl>
  );
};

export default DescriptionList;
