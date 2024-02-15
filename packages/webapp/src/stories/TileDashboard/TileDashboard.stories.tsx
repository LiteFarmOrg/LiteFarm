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
} from '../../components/TileDashboard';
import { componentDecorators } from '../Pages/config/Decorators';
import { ReactComponent as AlpacaIcon } from '../../assets/images/animals/alpaca-icon-btn-list.svg';
import { ReactComponent as CattleIcon } from '../../assets/images/animals/cattle-icon-btn-list.svg';
import { ReactComponent as ChickenIcon } from '../../assets/images/animals/chicken-icon-btn-list.svg';
import { ReactComponent as GoatIcon } from '../../assets/images/animals/goat-icon-btn-list.svg';
import { ReactComponent as PigIcon } from '../../assets/images/animals/pig-icon-btn-list.svg';
import { ReactComponent as RabbitIcon } from '../../assets/images/animals/rabbit-icon-btn-list.svg';
import { ReactComponent as SheepIcon } from '../../assets/images/animals/sheep-icon-btn-list.svg';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof PureTileDashboard> = {
  title: 'Components/PureTileDashboard',
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
  const [selectedFilterIds, setSelectedFilterIds] = useState<string[]>([]);

  const handleTileSelection = (id: string) => {
    setSelectedFilterIds((prev: string[]) => {
      const isSelected = prev.includes(id);
      return isSelected ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  // Pass to component in alphabetical order
  const sortedTiles = countTiles.sort((a, b) => a.label.localeCompare(b.label));

  // Add state handling to each tile's onClick
  const enrichedTiles: IconCountTile[] = sortedTiles.map((tile) => ({
    ...tile,
    onClick: () => handleTileSelection(tile.label),
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

const mockTiles = [
  {
    label: 'Goat',
    icon: <GoatIcon />,
    count: 6,
  },
  {
    label: 'Chicken',
    icon: <ChickenIcon />,
    count: 40,
  },
  {
    label: 'Pig',
    icon: <PigIcon />,
    count: 20,
  },
  {
    label: 'Cockatoo',
    icon: <ChickenIcon />,
    count: 2,
  },
  {
    label: 'Cow',
    icon: <CattleIcon />,
    count: 20,
  },
  {
    label: 'Dog',
    icon: <CattleIcon />,
    count: 3,
  },
  {
    label: 'Rabbit',
    icon: <RabbitIcon />,
    count: 24,
  },
  {
    label: 'Hamster',
    icon: <RabbitIcon />,
    count: 1,
  },
  {
    label: 'Guinea Pig',
    icon: <RabbitIcon />,
    count: 20,
  },
  {
    label: 'Draft Horse',
    icon: <SheepIcon />,
    count: 1,
  },
  {
    label: 'Barn Cat',
    icon: <CattleIcon />,
    count: 3,
  },
  {
    label: 'Tasmanian Devil',
    icon: <CattleIcon />,
    count: 3,
  },
  {
    label: 'Alpaca',
    icon: <AlpacaIcon />,
    count: 3,
  },
  {
    label: 'Sheep',
    icon: <SheepIcon />,
    count: 3,
  },
];

export const Default: Story = {
  args: {
    countTiles: mockTiles.slice(0, 5),
    dashboardTitle: 'Animal inventory',
    categoryLabel: 'Types',
  },
};

export const TwoTypes: Story = {
  args: {
    countTiles: mockTiles.slice(0, 2),
    dashboardTitle: 'Animal inventory',
    categoryLabel: 'Types',
  },
};

export const SeveralTypes: Story = {
  args: {
    countTiles: mockTiles.slice(0, 5),
    dashboardTitle: 'Animal inventory',
    categoryLabel: 'Types',
  },
};

export const ManyTypes: Story = {
  args: {
    countTiles: mockTiles,
    dashboardTitle: 'Animal inventory',
    categoryLabel: 'Types',
  },
};
