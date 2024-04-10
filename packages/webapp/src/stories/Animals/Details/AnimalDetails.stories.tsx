/*
 *  Copyright 2024 LiteFarm.org
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

import { Suspense } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import AnimalCreationDetails, {
  AnimalDetailsProps,
} from '../../../components/Animals/Creation/Details';
import { useForm } from 'react-hook-form';
import AnimalDetails from '../../../components/Animals/Creation/Details';
import GeneralDetails from '../../../components/Animals/Creation/Details/General';
import UniqueDetails from '../../../components/Animals/Creation/Details/Unique';
import OtherDetails from '../../../components/Animals/Creation/Details/Other';
import OriginDetails from '../../../components/Animals/Creation/Details/Origin';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<AnimalDetailsProps> = {
  title: 'Components/Animals/Creation/Details',
  component: AnimalDetails,
};
export default meta;

type Story = StoryObj<typeof AnimalCreationDetails>;

export const Default: Story = {
  render: () => {
    const rhFormMethods = useForm();

    return (
      <Suspense>
        <div style={{ padding: '16px' }}>
          <AnimalDetails formProps={rhFormMethods} />
        </div>
      </Suspense>
    );
  },
};

export const General: Story = {
  render: () => {
    const { watch, control } = useForm();

    return (
      <Suspense>
        <div style={{ padding: '16px' }}>
          <GeneralDetails
            watch={watch}
            control={control}
            types={[
              { value: 1, label: 'Cattle' },
              { value: 2, label: 'Pig' },
              { value: 3, label: 'Chicken' },
            ]}
            breeds={[
              { value: 1, label: 'Angus' },
              { value: 2, label: 'Cobb 5' },
            ]}
            sexes={[
              { value: 1, label: 'Male' },
              { value: 2, label: 'Female' },
              { value: 'undefined', label: `I don't know` },
            ]}
            uses={[
              { label: 'A', value: 'A' },
              { label: 'B', value: 'B' },
              { label: 'C', value: 'C' },
            ]}
          />
        </div>
      </Suspense>
    );
  },
};

export const Unique: Story = {
  render: () => {
    const { watch, control, register } = useForm();

    return (
      <Suspense>
        <div style={{ padding: '16px' }}>
          <UniqueDetails
            watch={watch}
            control={control}
            register={register}
            identifierTypes={[
              { value: 1, label: 'Ear tags' },
              { value: 2, label: 'Leg bands' },
            ]}
            identifierColors={[
              { value: 1, label: 'YELLOW' },
              { value: 2, label: 'WHITE' },
              { value: 3, label: 'ORANGE' },
              { value: 4, label: 'GREEN' },
              { value: 5, label: 'BLUE' },
              { value: 6, label: 'RED' },
            ]}
            identifierPlacements={[
              { value: 1, label: 'Brought in' },
              { value: 2, label: 'Born at the farm' },
            ]}
          />
        </div>
      </Suspense>
    );
  },
};

export const Other: Story = {
  render: () => {
    const { watch, control, register } = useForm();

    return (
      <Suspense>
        <div style={{ padding: '16px' }}>
          <OtherDetails
            watch={watch}
            control={control}
            register={register}
            organicStatuses={[
              { value: 'Non-Organic', label: 'Non-Organic' },
              { value: 'Organic', label: 'Organic' },
              { value: 'Transitional', label: 'Transitioning' },
            ]}
          />
        </div>
      </Suspense>
    );
  },
};

export const Origin: Story = {
  render: () => {
    const { watch, control, register } = useForm();

    return (
      <Suspense>
        <div style={{ padding: '16px' }}>
          <OriginDetails
            watch={watch}
            control={control}
            register={register}
            currency={'$'}
            originOptions={[
              { value: 1, label: 'Brought in' },
              { value: 2, label: 'Born at the farm' },
            ]}
          />
        </div>
      </Suspense>
    );
  },
};
