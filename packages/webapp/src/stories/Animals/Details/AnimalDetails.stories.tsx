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
import { FormProvider, useForm } from 'react-hook-form';
import { Meta, StoryObj } from '@storybook/react';
import AnimalCreationDetails, {
  AnimalDetailsProps,
} from '../../../components/Animals/AddAnimalsDetails';
import AnimalDetails from '../../../components/Animals/AddAnimalsDetails';
import { FormMethods } from '../../../components/Animals/AddAnimalsDetails/type';
import {
  sexOptions,
  sexDetailsOptions,
  useOptions,
  tagTypeOptions,
  tagColorOptions,
  tagPlacementOptions,
  organicStatusOptions,
  originOptions,
  defaultValues,
} from './mockData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<AnimalDetailsProps> = {
  title: 'Components/AddAnimalsDetails',
  component: AnimalDetails,
};
export default meta;

type Story = StoryObj<typeof AnimalCreationDetails>;

export const Default: Story = {
  render: () => {
    const formMethods: FormMethods = useForm({
      defaultValues,
    });

    return (
      <Suspense>
        <div style={{ padding: '16px' }}>
          <FormProvider {...formMethods}>
            <AnimalDetails
              generalDetailProps={{
                sexOptions,
                useOptions,
                sexDetailsOptions,
              }}
              uniqueDetailsProps={{
                tagTypeOptions,
                tagColorOptions,
                tagPlacementOptions,
              }}
              otherDetailsProps={{
                organicStatusOptions,
              }}
              originProps={{
                currency: '$',
                originOptions,
              }}
            />
          </FormProvider>
        </div>
      </Suspense>
    );
  },
};
