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

import React from 'react';
import styles from './cross.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

type CrossProps = {
  className?: string;
  isClickable?: boolean;
  onClick?: () => void;
};

const Cross = ({ className, onClick, isClickable, ...props }: CrossProps) => {
  return (
    <i
      className={clsx(styles.cross, isClickable && styles.clickable, className)}
      onClick={onClick}
      {...props}
    >
      &#215;
    </i>
  );
};

Cross.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Cross;
