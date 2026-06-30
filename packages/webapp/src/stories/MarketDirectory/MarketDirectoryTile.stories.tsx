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
import { componentDecorators } from '../Pages/config/Decorators';
import { PureMarketDirectoryTile } from '../../components/MarketDirectoryTile';
import Logo from '../../assets/images/certification/Farmland.svg';
import styles from './styles.module.scss';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof PureMarketDirectoryTile> = {
  title: 'Components/MarketDirectory/MarketDirectoryTile',
  component: PureMarketDirectoryTile,
  decorators: componentDecorators,
  args: {
    logo: <img src={Logo} alt="logo" width="100%" height="50px" />,
    name: 'LiteFarm',
    description: 'List products directly in LiteFarm stores.',
    website: 'https://litefarm.org',
    termsUrl: 'https://litefarm.org',
    onConsentChange: () => console.log('onConsentChange'),
    classNames: { container: styles.container },
  },
};
export default meta;

type Story = StoryObj<typeof PureMarketDirectoryTile>;

export const HasConsent: Story = {
  args: {
    hasConsent: true,
    isReadOnly: false,
  },
};

export const HasConsentReadOnly: Story = {
  args: {
    hasConsent: true,
    isReadOnly: true,
  },
};

export const NoConsent: Story = {
  args: {
    hasConsent: false,
    isReadOnly: false,
  },
};

export const NoConsentReadOnly: Story = {
  args: {
    hasConsent: false,
    isReadOnly: true,
  },
};
