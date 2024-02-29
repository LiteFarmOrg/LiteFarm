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
import type { FC } from 'react';
import styles from '../styles.module.scss';

export type IconTextProps = {
  text: string | number | null | undefined;
  icon: FC;
  subtext: string | null | undefined;
  count: number;
};

const IconText = ({ text, icon: Icon, subtext, count }: IconTextProps) => {
  return (
    <div className={styles.iconText}>
      <div className={styles.squareIcon}>
        <Icon />
      </div>
      <div className={clsx(styles.text, styles.overflowText, subtext && styles.withSubtextText)}>
        <div className={clsx(styles.identifier, subtext && styles.withSubtextMainText)}>
          {text}
          {count > 1 && <div className={styles.count}>{count}</div>}
        </div>
        <div className={clsx(subtext && styles.withSubtextSubext)}>{subtext}</div>
      </div>
    </div>
  );
};

export default IconText;
