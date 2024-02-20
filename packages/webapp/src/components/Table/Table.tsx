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
import ReactTable from './index';
import MuiTable from './v2';
import { TableType, KindComponentKVP, ReactTableProps, MuiTableProps } from './types';

const tableComponents: KindComponentKVP = {
  [TableType.V1]: (props: ReactTableProps) => <ReactTable {...props} />,
  [TableType.V2]: (props: MuiTableProps) => <MuiTable {...props} />,
};

/**
 * A component that selects between available Table styles.
 * See packages/webapp/src/stories/Table/Table.stories.jsx for examples.
 */
// TODO: export default function Table({ kind, ...props } : {kind:TableType, props: any | ReacttableProps | MuiTableProps}) {
export default function Table({ kind, ...props }: any) {
  const table = tableComponents[kind](props);
  return table;
}
