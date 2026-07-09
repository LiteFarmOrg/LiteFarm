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

import { Meta, StoryObj } from '@storybook/react';
import { Suspense } from 'react';
import CertificationCard from '../../components/Certifications/CertificationCard';

const meta: Meta<typeof CertificationCard> = {
  title: 'Components/Certifications/CertificationCard',
  component: CertificationCard,
  decorators: [
    (Story) => (
      <Suspense fallback="loading">
        <div style={{ maxWidth: 600, padding: 16 }}>
          <Story />
        </div>
      </Suspense>
    ),
  ],
  args: {
    certificationSystemType: 'Organic',
    certifierName: 'Soil Association',
    certificationIdentifier: 'UK-ORG-05-1234',
    expiryDate: '2026-12-31',
    onEdit: () => {},
    onDelete: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof CertificationCard>;

export const Active: Story = {
  args: { status: 'active' },
};

export const ExpiringSoon: Story = {
  args: { status: 'expiring_soon' },
};

export const Expired: Story = {
  args: { status: 'expired' },
};

export const Pursuing: Story = {
  args: {
    status: 'pursuing',
    certificationIdentifier: null,
    expiryDate: null,
  },
};
