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
  BatchDetailsProps,
} from '../../../components/Animals/AddBatchDetails';
import BatchDetails from '../../../components/Animals/AddBatchDetails';
import { FormMethods } from '../../../containers/Animals/AddAnimals/types';
import {
  sexOptions,
  sexDetailsOptions,
  useOptions,
  organicStatusOptions,
  originOptions,
  defaultValues,
  getOnFileUpload,
} from './mockData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<BatchDetailsProps> = {
  title: 'Components/AddBatchDetails',
  component: BatchDetails,
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
            <BatchDetails
              generalDetailProps={{
                sexOptions,
                useOptions,
                sexDetailsOptions,
              }}
              otherDetailsProps={{
                organicStatusOptions,
                getOnFileUpload,
                imageUploadTargetRoute: 'test',
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
