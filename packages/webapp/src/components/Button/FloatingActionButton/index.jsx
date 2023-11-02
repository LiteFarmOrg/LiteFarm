/*
 *  Copyright 2023 LiteFarm.org
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
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Fab } from '@mui/material';
import styles from './styles.module.scss';

export default function FloatingActionButton({ type }) {
  return <Fab color="yellow300" className={clsx(styles.floatingActionButton, styles[type])} />;
}

FloatingActionButton.propTypes = {
  type: PropTypes.oneOf(['add']),
};
