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
import styles from './layout.module.scss';

export type BentoLayoutProps = {
  children: ReactNode;
  layoutConfig?: {
    gapInPx: number;
    maxColumns: number;
  };
};

export default function BentoLayout({ children, layoutConfig }: BentoLayoutProps) {
  const style = layoutConfig
    ? ({
        '--bentoGap': `${layoutConfig.gapInPx}px`,
        '--bentoColumns': layoutConfig.maxColumns,
      } as React.CSSProperties)
    : {};

  return (
    <div className={styles.bento} style={style}>
      {children}
    </div>
  );
}
