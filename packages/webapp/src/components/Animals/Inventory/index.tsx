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
import Table from '../../../components/Table/Table';
import Layout from '../../../components/Layout';
import { TableType } from '../../Table/types';
import type { DefaultTheme } from '@mui/styles';

const PureAnimalInventory = ({
  tableData,
  getColumns,
  theme,
}: {
  tableData: object[];
  getColumns: Function;
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
        kind={TableType.V2}
        alternatingRowColor={true}
        columns={getColumns()}
        data={tableData}
        shouldFixTableLayout={true}
        minRows={tableData.length}
      />
    </Layout>
  );
};

export default PureAnimalInventory;
