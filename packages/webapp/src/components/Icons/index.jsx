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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import Cross from './cross';
import styles from './styles.module.scss';
import clsx from 'clsx';
import iconMap from './icons';

export { Cross };

export { iconMap };

const Icon = ({ iconName, circle = false, className = '', ...rest }) => {
  const CustomIcon = iconMap[iconName];

  // Wrapper for display block used to prevent overwriting display in className
  return (
    <div className={styles.displayBlock}>
      <div className={clsx(styles.icon, circle && styles.circle, className)}>
        <CustomIcon {...rest} />
      </div>
    </div>
  );
};

export default Icon;

export const Icons = ({ iconDetails, pill = false, className = '' }) => {
  const CustomIcons = iconDetails.map((iconDetail, i) => {
    const { iconName, ...rest } = iconDetail;
    const CustomIcon = iconMap[iconName];
    return <CustomIcon key={`${iconDetail.iconName}-${i}`} {...rest} />;
  });

  // Wrapper for display block used to prevent overwriting display in className
  return (
    <div className={styles.displayBlock}>
      <div className={clsx(styles.icons, pill && styles.pill, className)}>{...CustomIcons}</div>
    </div>
  );
};
