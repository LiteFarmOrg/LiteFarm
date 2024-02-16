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

import type { ReactNode } from 'react';
import type { ColumnInstance } from 'react-table';
import { ReactComponentLike } from 'prop-types';

export enum TableType {
  V1 = 'v1',
  V2 = 'v2',
}

enum Alignment {
  LEFT = 'left',
  RIGHT = 'right',
}

type CallbackFn = (props: any) => any;

export type ReactTableProps = {
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

export type MuiTableProps = {
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

export type KindComponentKVP = {
  [kind in TableType]: (props: any) => ReactNode;
};
