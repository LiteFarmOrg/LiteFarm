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

const certifierOptions = [
  { value: 1, label: 'Soil Association', key: 'SOIL_ASSOCIATION' },
  { value: 2, label: 'Ecocert', key: 'ECOCERT' },
  { value: 3, label: 'CCOF', key: 'CCOF' },
];

const certifiers = [
  { certifier_id: 1, system_type_id: 1, certifier_name: 'Islands Organic Producers Association' },
  { certifier_id: 2, system_type_id: 1, certifier_name: 'Kootenay Organic Growers Society' },
  { certifier_id: 3, system_type_id: 1, certifier_name: 'Living Earth Organic Growers' },
  {
    certifier_id: 4,
    system_type_id: 1,
    certifier_name: 'British Columbia Association for Regenerative Agriculture',
  },
  {
    certifier_id: 5,
    system_type_id: 1,
    certifier_name: 'Bio-Dynamic Agricultural Society of British Columbia',
  },
  { certifier_id: 6, system_type_id: 1, certifier_name: 'North Okanagan Organic Association' },
  {
    certifier_id: 7,
    system_type_id: 1,
    certifier_name: 'Similkameen Okanagan Organic Producers Association',
  },
  {
    certifier_id: 8,
    system_type_id: 1,
    certifier_name: 'Pacific Agricultural Certification Society',
  },
  { certifier_id: 9, system_type_id: 1, certifier_name: 'Fraser Valley Organic Producers' },
  { certifier_id: 10, system_type_id: 2, certifier_name: 'Asociación de Productores Orgánicos' },
  {
    certifier_id: 13,
    system_type_id: 2,
    certifier_name: 'Movimiento de economía Social y Solidaria del Ecuador',
  },
  {
    certifier_id: 15,
    system_type_id: 2,
    certifier_name: 'Centro Campesino para el Desarrollo Sustentable',
  },
  { certifier_id: 16, system_type_id: 2, certifier_name: 'Tijtoca Nemiliztli' },
  {
    certifier_id: 17,
    system_type_id: 2,
    certifier_name: 'Fundación para el Desarrollo Socioeconómico y Restauración Ambiental',
  },
  { certifier_id: 18, system_type_id: 2, certifier_name: 'Rede Ecovida de Agroecologia' },
  {
    certifier_id: 19,
    system_type_id: 2,
    certifier_name: 'Rede de Agroecologia Povos da Mata	Povos da',
  },
];

const systemTypes = [
  { id: 1, name: 'Third-party Organic', translation_key: 'THIRD_PARTY_ORGANIC' },
  { id: 2, name: 'Participatory Guarantee System', translation_key: 'PGS' },
];

const soilAssociationCertifier = certifierOptions[0];

const meta: Meta<typeof CertificationForm> = {
  title: 'Components/Certifications/CertificationForm',
  component: CertificationForm,
  decorators: [
    (Story) => (
      <Suspense fallback="loading">
        <div style={{ maxWidth: 1120 }}>
          <Story />
        </div>
      </Suspense>
    ),
  ],
  args: {
    systemTypes,
    certifiers,
    onSubmit: (data) => console.log('submit', data),
    onBack: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof CertificationForm>;

export const ThirdParty: Story = {
  args: {
    defaultValues: { system_type_id: 1 },
  },
};

export const PGS: Story = {
  args: {
    defaultValues: { system_type_id: 2 },
  },
};

export const EditExisting: Story = {
  args: {
    defaultValues: {
      system_type_id: 1,
      is_active: true,
      certification_type: 'ORGANIC',
      certifier: soilAssociationCertifier,
      certificationIdentifier: 'UK-ORG-05-1234',
      issue_date: '2024-01-01',
      valid_until: '2026-12-31',
    },
  },
};
