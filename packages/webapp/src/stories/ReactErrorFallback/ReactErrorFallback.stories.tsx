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
import { PureReactErrorFallback } from '../../components/ErrorHandler/PureReactErrorFallback';
import { Main } from '../../components/Typography';
import styles from './styles.module.scss';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof PureReactErrorFallback> = {
  title: 'Components/PureReactErrorFallback',
  component: PureReactErrorFallback,
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

type Story = StoryObj<typeof PureReactErrorFallback>;

export const Default: Story = {
  args: {
    handleReload: async () => {
      console.log('page reload clicked');
    },
    handleLogout: () => {
      console.log('logout clicked');
    },
  },
};
