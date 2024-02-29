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

import type { ReactElement, ReactNode } from 'react';
import type { ColumnInstance } from 'react-table';
import { ReactComponentLike } from 'prop-types';

export enum TableKind {
  V1 = 'v1',
  V2 = 'v2',
}

export enum CellKind {
  HOVER_PILL_OVERFLOW = 'hoverPillOverflow',
  ICON_TEXT = 'iconText',
  PLAIN = 'plain',
  RIGHT_CHEVRON_LINK = 'rightChevronLink',
}

enum Alignment {
  LEFT = 'left',
  RIGHT = 'right',
}

// Belongs in TableV1.jsx once converted to .ts
export type TableV1Props = {
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

// Belongs in TableV2.jsx once converted to .ts
export type TableV2Column = {
  id?: string | null;
  format: (props: any) => ReactNode;
  align?: Alignment;
  Footer?: ReactElement;
  columnProps?: Object;
  label?: string;
  sortable?: boolean;
};

// Belongs in TableV2.jsx once converted to .ts
export type TableV2Props = {
  alternatingRowColor?: boolean;
  columns: Required<TableV2Column[]>;
  data: Object[];
  showPagination?: boolean;
  pageSizeOptions?: number[];
  minRows?: number;
  dense?: boolean;
  FooterCell?: ReactComponentLike;
  onClickMore?: () => void;
  itemsToAddPerLoadMoreClick?: number;
  onRowClick?: () => void;
  shouldFixTableLayout?: boolean;
  defaultOrderBy?: string;
  showHeader?: boolean;
};
