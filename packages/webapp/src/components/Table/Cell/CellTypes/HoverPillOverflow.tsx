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
import { HoverPill, HoverPillProps } from '../../../HoverPill';
import styles from '../styles.module.scss';

export type HoverPillOverflowProps = HoverPillProps;

const HoverPillOverFlow = ({ items }: HoverPillOverflowProps) => {
  return (
    <div className={clsx(styles.text)}>
      {items.length === 0 ? null : <span className={styles.marginRight8px}>{items[0]}</span>}
      {items.length > 1 && <HoverPill items={items.slice(1)} />}
    </div>
  );
};

export default HoverPillOverFlow;
