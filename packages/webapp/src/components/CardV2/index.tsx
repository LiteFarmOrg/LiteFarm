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

import { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

type CardProps<T extends ElementType> = ComponentPropsWithoutRef<T> & {
  as?: T;
  isActive?: boolean;
  className?: string;
  children: ReactNode;
};

export default function Card<T extends ElementType = 'div'>({
  as,
  isActive,
  children,
  className,
  ...props
}: CardProps<T>) {
  const TagName = as || 'div';
  return (
    <TagName className={clsx(styles.card, isActive && styles.active, className)} {...props}>
      {children}
    </TagName>
  );
}
