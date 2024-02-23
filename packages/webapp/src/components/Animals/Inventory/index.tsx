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
import Table from '../../../components/Table';
import Layout from '../../../components/Layout';
import { MuiTableColumn, TableKind } from '../../Table/types';
import type { DefaultTheme } from '@mui/styles';

const PureAnimalInventory = ({
  tableData,
  animalsColumns,
  theme,
}: {
  tableData: object[];
  animalsColumns: MuiTableColumn[];
  theme: DefaultTheme;
}) => {
  return (
    <Layout
      classes={{
        container: { backgroundColor: theme.palette.background.paper },
      }}
      hasWhiteBackground
    >
      <Table
        kind={TableKind.V2}
        alternatingRowColor={true}
        columns={animalsColumns}
        data={tableData}
        shouldFixTableLayout={true}
        minRows={tableData.length}
        dense={false}
      />
    </Layout>
  );
};

export default PureAnimalInventory;
