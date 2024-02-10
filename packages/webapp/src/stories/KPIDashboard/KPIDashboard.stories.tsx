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

import { ReactNode } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../Pages/config/Decorators';
import { PureKPIDashboard } from '../../components/KPIDashboard';
import { Main } from '../../components/Typography';
import styles from './styles.module.scss';
import { ReactComponent as CattleIcon } from '../../assets/images/animals/cattle-icon-btn-list.svg';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof PureKPIDashboard> = {
  title: 'Components/PureKPIDashboard',
  component: PureKPIDashboard,
  decorators: [
    (Story) => (
      <ResizeWrapper>
        <Story />
      </ResizeWrapper>
    ),
    ...componentDecorators,
  ],
};
export default meta;

interface ResizeWrapperProps {
  children: ReactNode;
}

const ResizeWrapper = ({ children }: ResizeWrapperProps) => {
  return (
    <div className={styles.wrapper}>
      <Main className={styles.note}>Resize window to see mobile / desktop view</Main>
      {children}
    </div>
  );
};

type Story = StoryObj<typeof PureKPIDashboard>;

const mockKPIs = [
  {
    label: 'Goat',
    icon: <CattleIcon />,
    count: 6,
    onClick: () => console.log('Goat has been clicked!'),
  },
  {
    label: 'Barn Cat',
    icon: <CattleIcon />,
    count: 2,
    onClick: () => console.log('Cat has been clicked!'),
  },
  {
    label: 'Chicken',
    icon: <CattleIcon />,
    count: 40,
    onClick: () => console.log('Chicken has been clicked!'),
  },
  {
    label: 'Pig',
    icon: <CattleIcon />,
    count: 20,
    onClick: () => console.log('Pig has been clicked!'),
  },
  {
    label: 'Guinea Pig',
    icon: <CattleIcon />,
    count: 20,
    onClick: () => console.log('Guinea pig has been clicked!'),
  },
];

export const Default: Story = {
  args: {
    KPIs: mockKPIs,
    dashboardTitle: 'Animal inventory',
    categoryLabel: 'Types',
  },
};
