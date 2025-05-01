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
import clsx from 'clsx';
import styles from './layout.module.scss';

export type CardLayoutProps = {
  children: ReactNode;
  className?: string;
};

// Top-level component to wrap mainContent in a card past max-width
const CardLayout = ({ className = '', children }: CardLayoutProps) => {
  return <div className={clsx(styles.container, styles.paperContainer, className)}>{children}</div>;
};

export default CardLayout;
