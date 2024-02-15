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

import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import styles from './styles.module.scss';
import { Main } from '../../components/Typography';
import {
  PureTileDashboard,
  PureTileDashboardProps,
  IconCountTile,
  FilterId,
} from '../../components/TileDashboard';
import { componentDecorators } from '../Pages/config/Decorators';
import { mockTiles } from './mockTiles';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof PureTileDashboard> = {
  title: 'Components/TileDashboard',
  component: PureTileDashboard,
  decorators: [
    (Story, context) => (
      <DashboardContainer {...context.args}>
        <Story />
      </DashboardContainer>
    ),
    ...componentDecorators,
  ],
};
export default meta;

const DashboardContainer = ({
  countTiles,
  dashboardTitle,
  categoryLabel,
}: PureTileDashboardProps) => {
  const [selectedFilterIds, setSelectedFilterIds] = useState<FilterId[]>([]);

  const handleTileSelection = (id: FilterId) => {
    setSelectedFilterIds((prev) => {
      const isSelected = prev.includes(id);
      return isSelected ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  // Pass to component in alphabetical order
  const sortedTiles = countTiles.sort((a, b) => a.label.localeCompare(b.label));

  // Add state handling to each tile's onClick
  const enrichedTiles: IconCountTile[] = sortedTiles.map((tile, index) => ({
    ...tile,
    id: index, // <-- or, if preferred, label
    onClick: () => handleTileSelection(index), // or label
  }));

  return (
    <div className={styles.wrapper}>
      <Main className={styles.note}>Resize window to see mobile / desktop view</Main>
      <PureTileDashboard
        countTiles={enrichedTiles}
        dashboardTitle={dashboardTitle}
        categoryLabel={categoryLabel}
        selectedFilterIds={selectedFilterIds}
      />
    </div>
  );
};

type Story = StoryObj<typeof PureTileDashboard>;

export const Default: Story = {
  args: {
    countTiles: mockTiles.slice(0, 5) as IconCountTile[],
    dashboardTitle: 'Animal inventory',
    categoryLabel: 'Types',
  },
};

export const TwoTypes: Story = {
  args: {
    countTiles: mockTiles.slice(0, 2) as IconCountTile[],
    dashboardTitle: 'Animal inventory',
    categoryLabel: 'Types',
  },
};

export const ManyTypes: Story = {
  args: {
    countTiles: mockTiles as IconCountTile[],
    dashboardTitle: 'Animal inventory',
    categoryLabel: 'Types',
  },
};
