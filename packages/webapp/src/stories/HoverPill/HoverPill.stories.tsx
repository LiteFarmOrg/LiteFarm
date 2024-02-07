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
import clsx from 'clsx';
import { componentDecoratorsFullHeight } from '../Pages/config/Decorators';
import { HoverPill, HoverPillProps } from '../../components/HoverPill';
import styles from './styles.module.scss';

type HoverPillStoryProps = HoverPillProps & {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
};

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<HoverPillStoryProps> = {
  title: 'Components/HoverPill',
  component: HoverPill,
  argTypes: {
    position: {
      control: 'select',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
      description: 'Position of the hover pill within the Storybook frame',
    },
  },
  decorators: [
    (Story, context) => (
      <Wrapper position={context.args.position}>
        <Story />
      </Wrapper>
    ),
    ...componentDecoratorsFullHeight,
  ],

  // To reduce the height of the docs page canvas when using 100vh decorator
  // See https://github.com/storybookjs/storybook/issues/13765
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 300,
      },
    },
  },
};
export default meta;

interface WrapperProps {
  children: ReactNode;
  position?: string;
}

const Wrapper = ({ children, position = 'center' }: WrapperProps) => {
  return <div className={clsx(styles.wrapper, styles[position])}>{children}</div>;
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
