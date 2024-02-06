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
import { HoverPill } from '../../components/HoverPill';
import { Main } from '../../components/Typography';
import styles from './styles.module.scss';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof HoverPill> = {
  title: 'Components/HoverPill',
  component: HoverPill,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
    ...componentDecorators,
  ],
};
export default meta;

interface WrapperProps {
  children: ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  return (
    <div className={styles.wrapper}>
      {children}
      <Main className={styles.note}>Underlying content</Main>
    </div>
  );
};

type Story = StoryObj<typeof HoverPill>;

export const Plural: Story = {
  args: {
    items: ['Heifers', 'Foot Rot treatment', 'Feeding change'],
  },
};

export const Singular: Story = {
  args: {
    items: ['Feeding change'],
  },
};
