/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
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

import ReactTable from 'react-table';
import React from 'react';

// refer to Log/index.js for example on how to format columns and data props, or read react-table documentation
class Table extends React.Component {
  render() {
    const {
      columns,
      data,
      showPagination,
      pageSizeOptions,
      defaultPageSize,
      className,
      getTdProps,
      sortByID,
    } = this.props;
    let { minRows } = this.props;
    if (!minRows) {
      minRows = 5;
    }

    let defaultSorted = [];
    if (sortByID) {
      defaultSorted = [
        {
          id: sortByID,
          desc: true,
        },
      ];
    }
    return (
      <ReactTable
        className={className}
        columns={columns}
        data={data}
        showPagination={showPagination}
        pageSizeOptions={pageSizeOptions}
        defaultPageSize={defaultPageSize}
        minRows={showPagination ? undefined : minRows} // Messes up pagination
        getTdProps={getTdProps}
        defaultSorted={defaultSorted}
      />
    );
  }
}

export default Table;
