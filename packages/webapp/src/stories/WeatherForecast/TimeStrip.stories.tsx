/*
 *  Copyright 2026 LiteFarm.org
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

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import TimeStrip from '../../components/WeatherForecast/TimeStrip';
import { componentDecorators } from '../Pages/config/Decorators';

const meta: Meta<typeof TimeStrip> = {
  title: 'Components/WeatherForecast/TimeStrip',
  component: TimeStrip,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof TimeStrip>;

const date = new Date(2000, 1, 1, 0, 0, 0, 0);
const slots = Array.from({ length: 8 }, (_, index) => ({
  dt: date.getTime() / 1000 + index * 3 * 3600,
}));

const Wrapper = (args: { initialIndex: number }) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(args.initialIndex);
  const isFirstindex = selectedSlotIndex === 0;
  const isLastIndex = selectedSlotIndex === slots.length - 1;
  return (
    <TimeStrip
      slots={slots}
      selectedSlotIndex={selectedSlotIndex}
      offsetSeconds={-(date.getTimezoneOffset() * 60)}
      locale="en-US"
      onSelect={setSelectedSlotIndex}
      onPrev={isFirstindex ? undefined : () => setSelectedSlotIndex((i) => Math.max(0, i - 1))}
      onNext={
        isLastIndex
          ? undefined
          : () => setSelectedSlotIndex((i) => Math.min(slots.length - 1, i + 1))
      }
    />
  );
};

export const FirstSlotSelected: Story = { render: () => <Wrapper initialIndex={0} /> };
export const MiddleSlotSelected: Story = { render: () => <Wrapper initialIndex={4} /> };
export const LastSlotSelected: Story = {
  render: () => <Wrapper initialIndex={slots.length - 1} />,
};
