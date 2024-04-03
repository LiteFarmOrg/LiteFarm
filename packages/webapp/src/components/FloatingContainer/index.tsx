/*
 *  Copyright 2024 LiteFarm.org
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
import styles from './styles.module.scss';

type CSSLength = `${number}px` | `${number}%` | `${number}vw` | `${number}vh` | 'auto';

interface FloatingContainerProps {
  isCompactSideMenu: boolean;
  children: React.ReactNode;
  distanceFromBottom?: CSSLength;
}

const FloatingContainer = ({
  isCompactSideMenu,
  children,
  distanceFromBottom,
}: FloatingContainerProps) => {
  return (
    <div
      className={clsx(
        styles.container,
        isCompactSideMenu ? styles.withCompactSideMenu : styles.withExpandedSideMenu,
      )}
      style={
        distanceFromBottom && ({ '--bottom-offset': distanceFromBottom } as React.CSSProperties)
      }
    >
      {children}
    </div>
  );
};

export default FloatingContainer;
