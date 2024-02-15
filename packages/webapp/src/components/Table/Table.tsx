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
import type { ReactNode } from 'react';
import ReactTable from './index';
import type { ColumnInstance } from 'react-table';
import MuiTable from './v2';
import { TableType } from './constants';
import { ReactComponentLike } from 'prop-types';

enum Alignment {
  LEFT = 'left',
  RIGHT = 'right',
}

type CallbackFn = (props: any) => any;

type ReactTableProps = {
  columns: ColumnInstance[];
  data: Object[];
  showPagination: boolean;
  pageSizeOptions: number[];
  defaultPageSize: number;
  className: string;
  getTdProps: Function;
  sortByID: number;
  minRows: number;
  orderDesc: boolean;
};

type MuiTableColumn = {
  id: string;
  format: CallbackFn;
  align: Alignment;
  Footer: ReactNode;
  columnProps: Object;
  label: string;
};

type MuiTableProps = {
  columns: Required<MuiTableColumn[]>;
  data: Object[];
  showPagination: boolean;
  pageSizeOptions: number[];
  minRows: number;
  dense: boolean;
  FooterCell: ReactComponentLike;
  onClickMore: CallbackFn;
  itemsToAddPerLoadMoreClick: number;
  onRowClick: CallbackFn;
  shouldFixTableLayout: boolean;
  defaultOrderBy: string;
};

type KindComponentKVP = {
  [kind in TableType]: (props: any) => ReactNode;
};

const tableComponents: KindComponentKVP = {
  [TableType.V1]: (props: ReactTableProps) => <ReactTable {...props} />,
  [TableType.V2]: (props: MuiTableProps) => <MuiTable {...props} />,
};

/**
 * A component that places tiles so that the empty space is evenly distributed for any window sizes.
 * Either "children" or "tileType" and "tileData" props are required.
 * See packages/webapp/src/stories/Tile/Tiles.stories.jsx for examples.
 */
export default function Table({ kind, ...props }: { kind: TableType; props: any }) {
  const table = tableComponents[kind](props);
  return table;
}
