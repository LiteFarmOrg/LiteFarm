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

import { ReactNode } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import clsx from 'clsx';
import { componentDecoratorsFullHeight } from '../Pages/config/Decorators';
import {
  StatusIndicatorPill,
  StatusIndicatorPillProps,
  Status,
} from '../../components/StatusIndicatorPill';
import styles from './styles.module.scss';

type StatusIndicatorPillStoryProps = StatusIndicatorPillProps & {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
};

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<StatusIndicatorPillStoryProps> = {
  title: 'Components/StatusIndicatorPill',
  component: StatusIndicatorPill,
  argTypes: {
    position: {
      control: 'select',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
      description: 'Position of the status indicator pill within the Storybook frame',
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

type Story = StoryObj<typeof StatusIndicatorPill>;

export const Online: Story = {
  args: {
    status: Status.ONLINE,
    pillText: 'Online',
    tooltipText: 'Device has sent data in the last 12 hours',
  },
};

export const Offline: Story = {
  args: {
    status: Status.OFFLINE,
    pillText: 'Offline',
    tooltipText: 'Device has not sent data in the last 12 hours',
  },
};

export const HoverTooltipDisabled: Story = {
  args: {
    status: Status.OFFLINE,
    pillText: 'Offline',
    tooltipText: 'Device has not sent data in the last 12 hours',
    showHoverTooltip: false,
  },
};
