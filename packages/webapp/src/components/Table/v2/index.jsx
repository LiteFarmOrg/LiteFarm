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
import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { BsThreeDots } from 'react-icons/bs';
import clsx from 'clsx';
import EnhancedTableHead from './TableHead';
import Button from '../../Form/Button';
import styles from './styles.module.scss';

const More = ({ onClickLoadMore, onClickMore, invisibleRowCount, dense, colSpan }) => {
  const { t } = useTranslation();

  if (invisibleRowCount <= 0) {
    return null;
  }

  if (onClickMore) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className={clsx(styles.tableCell, dense && styles.dense)}>
          <button onClick={onClickMore} className={styles.moreButton}>
            <BsThreeDots />
            <span>{t('TABLE.NUMBER_MORE', { number: invisibleRowCount })}</span>
          </button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className={clsx(styles.loadMoreCell)}>
        <Button
          className={styles.loadMoreButton}
          onClick={onClickLoadMore}
          color={'secondary'}
          sm={true}
        >
          {t('TABLE.LOAD_MORE')}
        </Button>
      </TableCell>
    </TableRow>
  );
};

More.propTypes = {
  onClickLoadMore: PropTypes.func,
  onClickMore: PropTypes.func,
  invisibleRowCount: PropTypes.number,
  dense: PropTypes.bool,
  colSpan: PropTypes.number,
};

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const ITEMS_TO_ADD_PER_CLICK = 5;

/**
 * A table component built utilizing the Material Ui Table.
 * https://mui.com/material-ui/react-table/
 */
export default function EnhancedTable(props) {
  const {
    columns,
    data,
    FooterCell,
    minRows = 10,
    onRowClick,
    showPagination,
    pageSizeOptions = [5, 10, 20, 50],
    onClickMore,
    dense = true,
    shouldFixTableLayout = false,
    defaultOrderBy = '',
  } = props;

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(minRows);

  const fullColSpan = columns.reduce((total, column) => total + (column.id ? 1 : 0), 0);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (event, index) => {
    if (onRowClick) {
      onRowClick(event, index);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onClickLoadMore = () => {
    const rowCount = Math.min(rowsPerPage + ITEMS_TO_ADD_PER_CLICK, data.length);
    setRowsPerPage(rowCount);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const visibleRows = useMemo(
    () =>
      data
        .slice()
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage],
  );

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer>
        <Table
          aria-labelledby="tableTitle"
          className={clsx(styles.table, shouldFixTableLayout && styles.fixed)}
        >
          <EnhancedTableHead
            columns={columns}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            dense={dense}
          />
          <TableBody>
            {visibleRows.map((row, index) => {
              return (
                <TableRow
                  key={index}
                  onClick={(event) => handleRowClick(event, row)}
                  className={clsx(styles.tableRow, onRowClick && styles.clickable)}
                >
                  {columns.map(({ id, format, accessor, align, columnProps }) => {
                    if (!id) {
                      return null;
                    }

                    const dataGetter = accessor || id;
                    const data =
                      typeof dataGetter === 'function' ? dataGetter(row) : row[dataGetter];

                    return (
                      <TableCell
                        key={id}
                        className={clsx(styles.tableCell, dense && styles.dense)}
                        align={align || 'left'}
                        {...columnProps}
                      >
                        {format ? format(row) : data}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: (dense ? 40 : 56) * emptyRows }}>
                <TableCell colSpan={fullColSpan} sx={{ border: 'none' }} />
              </TableRow>
            )}
            {!showPagination && (
              <More
                onClickMore={onClickMore}
                onClickLoadMore={onClickLoadMore}
                invisibleRowCount={!showPagination && data.length - rowsPerPage}
                dense={dense}
                colSpan={fullColSpan}
              />
            )}
            {columns.some((column) => column.id && column.Footer) && (
              <TableRow className={styles.footer}>
                {columns.map(({ id, align, columnProps, Footer }) => {
                  if (!id) {
                    return null;
                  }
                  return (
                    <TableCell
                      key={id}
                      align={align || 'left'}
                      className={clsx(styles.tableCell, dense && styles.dense)}
                      {...columnProps}
                    >
                      {Footer}
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
            {FooterCell ? (
              <TableRow>
                <TableCell className={styles.footerCell} colSpan={fullColSpan}>
                  <FooterCell />
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
      {showPagination && (
        <TablePagination
          rowsPerPageOptions={pageSizeOptions}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  );
}

EnhancedTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      format: PropTypes.func,
      accessor: PropTypes.func,
      align: PropTypes.oneOf(['left', 'right']),
      Footer: PropTypes.node,
      columnProps: PropTypes.object,
    }),
  ),
  data: PropTypes.array,
  showPagination: PropTypes.bool,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  minRows: PropTypes.number,
  dense: PropTypes.bool,
  FooterCell: PropTypes.elementType,
  onClickMore: PropTypes.func,
  onRowClick: PropTypes.func,
  shouldFixTableLayout: PropTypes.bool,
  defaultOrderBy: PropTypes.string,
};
