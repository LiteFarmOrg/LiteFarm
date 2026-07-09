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
import CertificationForm from '../../components/Certifications/CertificationForm';

const certificationTypeOptions = [
  { value: 1, label: 'Organic' },
  { value: 2, label: 'Biodynamic' },
  { value: 3, label: 'Regenerative' },
  { value: 4, label: 'Fair Trade' },
];

const certifierOptions = [
  { value: 1, label: 'Soil Association', key: 'SOIL_ASSOCIATION' },
  { value: 2, label: 'Ecocert', key: 'ECOCERT' },
  { value: 3, label: 'CCOF', key: 'CCOF' },
];

const soilAssociationCertifier = certifierOptions[0];

const meta: Meta<typeof CertificationForm> = {
  title: 'Components/Certifications/CertificationForm',
  component: CertificationForm,
  decorators: [
    (Story) => (
      <Suspense fallback="loading">
        <div style={{ maxWidth: 480 }}>
          <Story />
        </div>
      </Suspense>
    ),
  ],
  args: {
    certificationTypeOptions,
    certifierOptions,
    onSubmit: (data) => console.log('submit', data),
    onBack: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof CertificationForm>;

export const ThirdParty: Story = {};

export const PGS: Story = {
  args: {
    defaultValues: { systemType: 'pgs' },
  },
};

export const EditExisting: Story = {
  args: {
    defaultValues: {
      systemType: 'third_party',
      isActive: true,
      certificationTypeId: 1,
      certifier: soilAssociationCertifier,
      certificationIdentifier: 'UK-ORG-05-1234',
      startDate: '2024-01-01',
      expiryDate: '2026-12-31',
    },
  },
};
