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

const IN_45_DAYS = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const meta: Meta<typeof CertificationCard> = {
  title: 'Components/Certifications/CertificationCard',
  component: CertificationCard,
  decorators: [
    (Story) => (
      <Suspense fallback="loading">
        <div style={{ maxWidth: 786, padding: 16 }}>
          <Story />
        </div>
      </Suspense>
    ),
  ],
  args: {
    certificationSystemType: 'Third-party organic',
    systemType: 'third_party',
    certifierName: 'BCARA',
    certificationIdentifier: 'CAN-ORG-2024-01567',
    expiryDate: '2026-02-28',
    onEdit: () => {},
    onDelete: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof CertificationCard>;

export const Active: Story = {
  args: {
    status: 'active',
    documentFileName: 'Organic-BC.pdf',
  },
};

export const ExpiringSoon: Story = {
  args: {
    status: 'expiring_soon',
    certificationSystemType: 'Participatory guarantee system',
    systemType: 'pgs',
    certifierName: 'FVOPA',
    expiryDate: IN_45_DAYS,
  },
};

export const Expired: Story = {
  args: {
    status: 'expired',
    certificationSystemType: 'Participatory guarantee system',
    systemType: 'pgs',
    certifierName: 'FVOPA',
    expiryDate: '2025-07-31',
  },
};

export const Pursuing: Story = {
  args: {
    status: 'pursuing',
    certificationSystemType: 'third-party organic',
    certifierName: 'CCOF — California Certified Organic Farmers',
    certificationIdentifier: null,
    expiryDate: null,
  },
};

export const Mobile: Story = {
  args: {
    status: 'active',
    documentFileName: 'Organic-BC.pdf',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 301 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
