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

import clsx from 'clsx';
import { ReactNode } from 'react';
import styles from './layout.module.scss';

export type BentoLayoutProps = {
  children: ReactNode;
  gap?: number;
  maxColumns?: number;
  bentoOffMedium?: boolean;
};

export default function BentoLayout({
  children,
  gap = 8,
  maxColumns = 3,
  bentoOffMedium = true,
}: BentoLayoutProps) {
  const style = {
    '--bentoGap': `${gap}px`,
    '--bentoColumns': maxColumns,
  } as React.CSSProperties;

  return (
    <div className={clsx(styles.bento, bentoOffMedium && styles.bentoOffMedium)} style={style}>
      {children}
    </div>
  );
}
