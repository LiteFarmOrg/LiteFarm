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
import SensorsForm, {
  SensorsFormProps,
} from '../../../../../components/LocationDetailLayout/PointDetails/Sensor/V2/SensorsForm';

const meta: Meta<SensorsFormProps> = {
  title: 'Form/Location/Point/SensorV2/Sensors',
  component: SensorsForm,
  decorators: decorator,
};
export default meta;

type Story = StoryObj<typeof SensorsForm>;

export const Post: Story = {
  render: () => {
    const formMethods = useForm({
      defaultValues: {
        arrays: [
          { sensor_count: 2, sensors: [{ id: 1 }] },
          { sensor_count: 1, sensors: [{ id: 2 }, { id: 3 }] },
        ],
      },
    });

    return (
      <FormProvider {...formMethods}>
        <SensorsForm system="metric" />
      </FormProvider>
    );
  },
};
