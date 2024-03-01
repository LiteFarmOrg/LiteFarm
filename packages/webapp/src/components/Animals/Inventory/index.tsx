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
import type { AnimalInventory } from '../../../containers/Animals/Inventory/useAnimalInventory';
import { TableV2Column, TableKind } from '../../Table/types';
import type { DefaultTheme } from '@mui/styles';

const PureAnimalInventory = ({
  tableData,
  animalsColumns,
  theme,
  isMobile,
}: {
  tableData: AnimalInventory[];
  animalsColumns: TableV2Column[];
  theme: DefaultTheme;
  isMobile: boolean;
}) => {
  return (
    <Layout
      classes={{
        container: {
          backgroundColor: theme.palette.background.paper,
          borderRadius: '8px',
          border: '1px solid var(--Colors-Primary-Primary-teal-50)',
          marginTop: '16px',
        },
      }}
      hasWhiteBackground
      footer={false}
    >
      <Table
        kind={TableKind.V2}
        alternatingRowColor={true}
        columns={animalsColumns}
        data={tableData}
        shouldFixTableLayout={isMobile ? false : true}
        minRows={tableData.length}
        dense={false}
        showHeader={!isMobile}
      />
    </Layout>
  );
};

export default PureAnimalInventory;
