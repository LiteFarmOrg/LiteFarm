/*
 *  Copyright 2025 LiteFarm.org
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

import { Meta, StoryObj } from '@storybook/react';
import BentoLayout, { BentoLayoutProps } from '../../components/Layout/BentoLayout';
import { componentDecorators } from '../Pages/config/Decorators';
import styles from './styles.module.scss';

const Template = (args: Required<BentoLayoutProps>) => {
  return (
    <BentoLayout {...args}>
      {new Array(args.maxColumns || 3 + 2).fill('').map((_val, id) => {
        return <div key={id} className={styles.emptyTile} />;
      })}
    </BentoLayout>
  );
};

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof Template> = {
  title: 'Components/Layout/BentoLayout',
  component: Template,
  decorators: [...componentDecorators],
};
export default meta;

type Story = StoryObj<typeof Template>;

export const Default: Story = {
  args: {},
};

export const MaxFiveWidth: Story = {
  args: {
    maxColumns: 5,
  },
};

export const SixteenPxGap: Story = {
  args: {
    gap: 16,
  },
};

export const Responsive: Story = {
  args: {
    bentoOffMedium: false,
  },
};
