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
import PropTypes from 'prop-types';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import clsx from 'clsx';
import ChevronDown from '../../../assets/images/chevron-down.svg?react';
import styles from './styles.module.scss';

export default function EnhancedTableHead({ columns, order, orderBy, onRequestSort, dense }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow className={styles.tableRow}>
        {columns.map(({ id, align, columnProps, label }) => {
          if (!id) {
            return null;
          }
          return (
            <TableCell
              key={id}
              align={align || 'left'}
              sortDirection={orderBy === id ? order : false}
              className={clsx(styles.tableCell, styles.tableHead, dense && styles.dense)}
              {...columnProps}
            >
              <TableSortLabel
                active={orderBy === id}
                direction={orderBy === id ? order : 'asc'}
                onClick={createSortHandler(id)}
                IconComponent={ChevronDown}
              >
                <span className={styles.headerLabel}>{label}</span>
              </TableSortLabel>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  columns: PropTypes.array.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  dense: PropTypes.bool,
};
