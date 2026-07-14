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
import CertificationsList from '../../components/Certifications/CertificationsList';
import type { CertificationItem } from '../../components/Certifications/types';
import { componentDecorators } from '../Pages/config/Decorators';

const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const activeCert: CertificationItem = {
  id: '1',
  systemTypeTranslationKey: 'THIRD_PARTY_ORGANIC',
  certifierName: 'BCARA',
  certificateNumber: 'CAN-ORG-2024-01567',
  isActive: true,
  expiryDate: daysFromNow(365),
  documentFileName: 'Organic-BC.pdf',
};

const expiringSoonCert: CertificationItem = {
  id: '2',
  systemTypeTranslationKey: 'PGS',
  certifierName: 'FVOPA',
  certificateMemberId: 'Ecocert',
  isActive: true,
  expiryDate: daysFromNow(20),
};

const pursuingCert: CertificationItem = {
  id: '3',
  systemTypeTranslationKey: 'THIRD_PARTY_ORGANIC',
  certifierName: 'CCOF — California Certified Organic Farmers',
  isActive: false,
};

const meta: Meta<typeof CertificationsList> = {
  title: 'Components/Certifications/CertificationsList',
  component: CertificationsList,
  decorators: componentDecorators,
  args: {
    onEdit: () => {},
    onDelete: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof CertificationsList>;

export const MixedCertifications: Story = {
  args: {
    certifications: [activeCert, expiringSoonCert, pursuingCert],
  },
};

export const ActiveOnly: Story = {
  args: {
    certifications: [activeCert, expiringSoonCert],
  },
};

export const PursuingOnly: Story = {
  args: {
    certifications: [pursuingCert],
  },
};
