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
import { useForm } from 'react-hook-form';
import { Meta, StoryObj } from '@storybook/react';
import AnimalCreationDetails, {
  AnimalDetailsProps,
} from '../../../components/Animals/Creation/Details';
import AnimalDetails from '../../../components/Animals/Creation/Details';
import { FormMethods } from '../../../components/Animals/Creation/Details/type';
import {
  types,
  breeds,
  sexes,
  uses,
  tagTypes,
  tagColors,
  tagPlacements,
  organicStatuses,
  originOptions,
} from './mockData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<AnimalDetailsProps> = {
  title: 'Components/Animals/Creation/Details',
  component: AnimalDetails,
};
export default meta;

type Story = StoryObj<typeof AnimalCreationDetails>;

export const Default: Story = {
  render: () => {
    const formMethods: FormMethods = useForm();

    return (
      <Suspense>
        <div style={{ padding: '16px' }}>
          <AnimalDetails
            formMethods={formMethods}
            generalDetailProps={{
              types,
              breeds,
              sexes,
              uses,
            }}
            uniqueDetailsProps={{
              tagTypes,
              tagColors,
              tagPlacements,
            }}
            otherDetailsProps={{
              organicStatuses,
            }}
            originProps={{
              currency: '$',
              originOptions,
            }}
          />
        </div>
      </Suspense>
    );
  },
};
