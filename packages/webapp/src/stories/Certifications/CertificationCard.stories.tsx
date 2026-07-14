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
import CertificationCard from '../../components/Certifications/CertificationCard';
import { componentDecorators } from '../Pages/config/Decorators';

const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

// Status is derived: isActive false → pursuing; then past expiry → expired, ≤30 days → expiring soon
const ACTIVE_EXPIRY = daysFromNow(365);
const EXPIRING_SOON_EXPIRY = daysFromNow(20);
const EXPIRED_EXPIRY = daysFromNow(-30);

const meta: Meta<typeof CertificationCard> = {
  title: 'Components/Certifications/CertificationCard',
  component: CertificationCard,
  decorators: componentDecorators,
  args: {
    systemTypeTranslationKey: 'THIRD_PARTY_ORGANIC',
    certifierAcronym: 'BCARA',
    certifierName: 'British Columbia Association for Regenerative Agriculture',
    certificateNumber: 'CAN-ORG-2024-01567',
    isActive: true,
    expiryDate: ACTIVE_EXPIRY,
    onEdit: () => {},
    onDelete: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof CertificationCard>;

export const Active: Story = {
  args: {
    documentFileName: 'Organic-BC.pdf',
  },
};

export const ExpiringSoon: Story = {
  args: {
    systemTypeTranslationKey: 'PGS',
    certifierName: 'Fraser Valley Organic Producers',
    certifierAcronym: 'FVOPA',
    certificateMemberId: 'Ecocert',
    expiryDate: EXPIRING_SOON_EXPIRY,
  },
};

export const Expired: Story = {
  args: {
    systemTypeTranslationKey: 'PGS',
    certifierName: 'Fraser Valley Organic Producers',
    certifierAcronym: 'FVOPA',
    certificateMemberId: 'Ecocert',
    expiryDate: EXPIRED_EXPIRY,
  },
};

export const Pursuing: Story = {
  args: {
    certifierName: 'California Certified Organic Farmers',
    certifierAcronym: 'CCOF',
    certificateNumber: null,
    isActive: false,
    expiryDate: null,
  },
};

export const WithoutDeleteButton: Story = {
  args: {
    onDelete: undefined,
  },
};

export const Mobile: Story = {
  args: {
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
