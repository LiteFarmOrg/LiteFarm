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
  certificationSystemType: 'Organic',
  certifierName: 'Soil Association',
  certificationIdentifier: 'UK-ORG-05-1234',
  status: 'active',
  expiryDate: '2026-12-31',
};

const expiringSoonCert: CertificationItem = {
  id: '2',
  certificationSystemType: 'Biodynamic',
  certifierName: 'Demeter',
  certificationIdentifier: 'DEM-2024-0042',
  status: 'expiring_soon',
  expiryDate: '2025-09-30',
};

const pursuingCert: CertificationItem = {
  id: '3',
  certificationSystemType: 'Regenerative',
  certifierName: 'Regeneration Canada',
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
