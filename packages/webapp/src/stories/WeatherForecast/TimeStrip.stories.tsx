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

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import TimeStrip from '../../components/WeatherForecast/TimeStrip';
import { componentDecoratorsWithoutPadding } from '../Pages/config/Decorators';
import { buildMockForecast } from './mockData';

const forecast = buildMockForecast();

const meta: Meta<typeof TimeStrip> = {
  title: 'Components/WeatherForecast/TimeStrip',
  component: TimeStrip,
  decorators: componentDecoratorsWithoutPadding,
};
export default meta;

type Story = StoryObj<typeof TimeStrip>;

const Wrapper = (args: { initialIndex: number }) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(args.initialIndex);
  return (
    <TimeStrip
      slots={forecast.slots}
      selectedSlotIndex={selectedSlotIndex}
      offsetSeconds={forecast.city.timezoneOffsetSeconds}
      locale="en-US"
      onSelect={setSelectedSlotIndex}
      onPrev={() => setSelectedSlotIndex((i) => Math.max(0, i - 1))}
      onNext={() => setSelectedSlotIndex((i) => Math.min(forecast.slots.length - 1, i + 1))}
    />
  );
};

export const FirstSlotSelected: Story = { render: () => <Wrapper initialIndex={0} /> };
export const MiddleSlotSelected: Story = { render: () => <Wrapper initialIndex={20} /> };
export const LastSlotSelected: Story = {
  render: () => <Wrapper initialIndex={forecast.slots.length - 1} />,
};
