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
import CertificationsList from '../../components/Certifications/CertificationsList';
import type { CertificationItem } from '../../components/Certifications/types';

const activeCert: CertificationItem = {
  id: '1',
  certificationSystemType: 'Third-party organic',
  systemType: 'third_party',
  certifierName: 'BCARA',
  certificationIdentifier: 'CAN-ORG-2024-01567',
  status: 'active',
  expiryDate: '2026-02-28',
  documentFileName: 'Organic-BC.pdf',
};

const expiringSoonCert: CertificationItem = {
  id: '2',
  certificationSystemType: 'Participatory guarantee system',
  systemType: 'pgs',
  certifierName: 'FVOPA',
  certificationIdentifier: 'CAN-ORG-2024-01567',
  status: 'expiring_soon',
  expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

const pursuingCert: CertificationItem = {
  id: '3',
  certificationSystemType: 'third-party organic',
  systemType: 'third_party',
  certifierName: 'CCOF — California Certified Organic Farmers',
  status: 'pursuing',
};

const meta: Meta<typeof CertificationsList> = {
  title: 'Components/Certifications/CertificationsList',
  component: CertificationsList,
  decorators: [
    (Story) => (
      <Suspense fallback="loading">
        <div style={{ maxWidth: 640, padding: 16 }}>
          <Story />
        </div>
      </Suspense>
    ),
  ],
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
