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
import TableV1 from './TableV1';
import TableV2 from './TableV2';
import { TableKind, TableV1Props, TableV2Props } from './types';

type TableV1PropsStrategy = TableV1Props & { kind: TableKind.V1 };
type TableV2PropsStrategy = TableV2Props & { kind: TableKind.V2 };

type TableStrategyProps = TableV1PropsStrategy | TableV2PropsStrategy;

/**
 * A component that selects between available Table styles.
 * See packages/webapp/src/stories/Table/Table.stories.jsx for examples.
 */
const Table = ({ kind, ...props }: TableStrategyProps) => {
  switch (kind) {
    case TableKind.V1:
      return <TableV1 {...(props as TableV1Props)} />;
    case TableKind.V2:
      return <TableV2 {...(props as TableV2Props)} />;
    default:
      return <TableV2 {...(props as TableV2Props)} />;
  }
};

export default Table;
