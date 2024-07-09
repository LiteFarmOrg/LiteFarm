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

import { Meta, StoryObj } from '@storybook/react';
import { FormProvider, useForm } from 'react-hook-form';
import { componentDecorators } from '../../config/Decorators';
import AddSoilAmendmentProducts, {
  type AddSoilAmendmentProductsProps,
} from '../../../../components/Task/AddSoilAmendmentProducts';
import { defaultValues } from '../../../../components/Task/AddSoilAmendmentProducts/ProductCard/ProductDetails';
import { products } from './products';
import { ProductFormFields } from '../../../../components/Task/AddSoilAmendmentProducts/types';

const purposes = [
  { id: 1, key: 'STRUCTURE' },
  { id: 2, key: 'MOISTURE_RETENTION' },
  { id: 3, key: 'NUTRIENT_AVAILABILITY' },
  { id: 4, key: 'PH' },
  { id: 5, key: 'OTHER' },
];

const fertiliserTypes = [
  { id: 1, key: 'DRY' },
  { id: 2, key: 'LIQUID' },
];

type ComponentWithFormMethodsProps = AddSoilAmendmentProductsProps & {
  defaultValues: (ProductFormFields & { product_id?: number })[];
};

const ComponentWithFormMethods = ({ defaultValues, ...props }: ComponentWithFormMethodsProps) => {
  const methods = useForm({
    mode: 'onChange',
    defaultValues: { soil_amendment_task_products: defaultValues },
  });
  return (
    <FormProvider {...methods}>
      <AddSoilAmendmentProducts {...props} />
    </FormProvider>
  );
};

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<ComponentWithFormMethodsProps> = {
  title: 'Page/Task/AddSoilAmendmentProducts',
  component: ComponentWithFormMethods,
  decorators: [...componentDecorators],
  args: {
    onSaveProduct: console.log,
    system: 'metric',
    products,
    purposes,
    fertiliserTypes,
    defaultValues: [defaultValues],
    location: {
      type: 'garden',
      total_area: 15000,
      total_area_unit: 'm2',
    },
  },
};

export default meta;

type Story = StoryObj<typeof ComponentWithFormMethods>;

export const InterestedInCertification: Story = {
  args: { farm: { interested: true, country_id: 1, farm_id: 'xxx' } },
};

export const NotInterestedInCertification: Story = {
  args: { farm: { interested: false, country_id: 37, farm_id: 'xxx' } },
};

export const InterestedInCertificationInCanada: Story = {
  args: { farm: { interested: true, country_id: 37, farm_id: 'xxx' } },
};

export const ReadOnly: Story = {
  args: {
    isReadOnly: true,
    farm: { interested: true, country_id: 37, farm_id: 'xxx' },
    defaultValues: [
      {
        ...defaultValues,
        product_id: 3,
      },
    ],
  },
};
