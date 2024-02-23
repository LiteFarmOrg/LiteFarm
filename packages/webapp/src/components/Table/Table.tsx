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
import ReactTable from './index';
import MuiTable from './v2';
import { TableType, ReactTableProps, MuiTableProps, StrategyProps } from './types';

type ReactTablePropsStrategy = ReactTableProps & StrategyProps;
type MuiTablePropsStrategy = MuiTableProps & StrategyProps;

type TableStrategyProps = ReactTablePropsStrategy | MuiTablePropsStrategy;

/**
 * A component that selects between available Table styles.
 * See packages/webapp/src/stories/Table/Table.stories.jsx for examples.
 */
const Table = ({ kind, ...props }: TableStrategyProps) => {
  switch (kind) {
    case TableType.V1:
      return <ReactTable {...(props as ReactTablePropsStrategy)} />;
    case TableType.V2:
      return <MuiTable {...(props as MuiTablePropsStrategy)} />;
    default:
      return <MuiTable {...(props as MuiTablePropsStrategy)} />;
  }
};

export default Table;
