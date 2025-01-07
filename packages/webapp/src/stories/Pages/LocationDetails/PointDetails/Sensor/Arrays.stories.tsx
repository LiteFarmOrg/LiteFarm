/*
 *  Copyright 2025 LiteFarm.org
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
import { FormProvider, useForm } from 'react-hook-form';
import { Meta, StoryObj } from '@storybook/react';
import decorator from '../../../config/Decorators';
import ArraysForm, {
  ArraysFormProps,
} from '../../../../../components/LocationDetailLayout/PointDetails/Sensor/V2/ArraysForm';

const meta: Meta<ArraysFormProps> = {
  title: 'Form/Location/Point/SensorV2/Arrays',
  component: ArraysForm,
  decorators: decorator,
};
export default meta;

type Story = StoryObj<typeof ArraysForm>;

export const Post: Story = {
  render: () => {
    const formMethods = useForm({
      defaultValues: {
        arrays: [{ sensor_count: 1 }],
      },
    });

    return (
      <FormProvider {...formMethods}>
        <ArraysForm
          onPlaceOnMapClick={() => console.log('Place on map')}
          fields={[
            { location_id: '1xxx', name: 'field 1' },
            { location_id: '2xxx', name: 'field 2' },
          ]}
        />
      </FormProvider>
    );
  },
};
