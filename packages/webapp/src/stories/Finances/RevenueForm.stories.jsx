/*
 *  Copyright 2023-2026 LiteFarm.org
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
import { useState } from 'react';
import RevenueForm from '../../components/Forms/RevenueForm';
import { getEntityTypeDefaultValues } from '../../containers/Finances/EntitySaleInputs';
import { componentDecorators } from '../Pages/config/Decorators';

const system = 'metric';

const cropSale = {
  sale_id: 17,
  customer_name: 'Name',
  sale_date: '2023-09-23T04:00:00.000Z',
  farm_id: null,
  revenue_type_id: 1,
  note: 'note',
  crop_variety_sale: [
    {
      sale_id: 17,
      quantity: 55000,
      sale_value: 55,
      crop_variety_id: '51cee7c8-58b9-11ee-8cb8-ce0b8496eaaa',
      quantity_unit: 'mt',
    },
    {
      sale_id: 17,
      quantity: 55,
      sale_value: 55,
      crop_variety_id: '58007a70-5cb1-11ee-9207-ce0b8496eaa9',
      quantity_unit: 'kg',
    },
  ],
};

const generalSale = {
  sale_id: 11,
  customer_name: 'New general sale ok 2',
  sale_date: '2023-09-28T04:00:00.000Z',
  farm_id: 1,
  revenue_type_id: 2,
  value: 49,
  note: 'hya',
};

const animalSale = {
  sale_id: 23,
  customer_name: 'Animal customer',
  sale_date: '2023-10-15T04:00:00.000Z',
  farm_id: null,
  revenue_type_id: 3,
  note: 'animal note',
  animal_sale: [
    {
      animal_id: 101,
      animal_batch_id: null,
      quantity: 1,
      sale_value: 250,
      quantity_unit: 'unit',
    },
    {
      animal_id: null,
      animal_batch_id: 7,
      quantity: 10,
      sale_value: 500,
      quantity_unit: 'unit',
    },
  ],
};

const revenueTypes = [
  {
    revenue_type_id: 1,
    revenue_name: 'Crop Sale',
    revenue_translation_key: 'CROP_SALE',
    farm_id: null,
    deleted: false,
    entity_type: 'crop',
  },
  {
    revenue_type_id: 2,
    revenue_name: 'General Sale',
    revenue_translation_key: 'GENERAL_SALE',
    farm_id: 1,
    deleted: false,
    entity_type: null,
  },
  {
    revenue_type_id: 3,
    revenue_name: 'Animal Sale',
    revenue_translation_key: 'ANIMAL_SALE',
    farm_id: null,
    deleted: false,
    entity_type: 'animal',
  },
];
const revenueTypeOptions = [
  {
    value: 1,
    label: 'Crop Sale',
  },
  {
    value: 2,
    label: 'General Sale',
  },
  {
    value: 3,
    label: 'Animal Sale',
  },
];

const RevenueFormWithState = (props) => {
  const { view } = props;
  const [isEditing, setIsEditing] = useState(false);

  if (view === 'add') {
    return <RevenueForm {...props} />;
  }
  return (
    <RevenueForm
      key={isEditing ? 'editing' : 'readonly'}
      onSubmit={isEditing ? console.log : undefined}
      view={isEditing ? 'edit' : 'read-only'}
      handleGoBack={isEditing ? () => setIsEditing(false) : () => {}}
      onClick={isEditing ? undefined : () => setIsEditing(true)}
      buttonText={isEditing ? 'Save' : 'Edit'}
      {...props}
    />
  );
};

export default {
  title: 'Components/RevenueForm',
  component: RevenueFormWithState,
  decorators: componentDecorators,
};

const Template = (args) => <RevenueFormWithState {...args} />;

export const AddCropSale = Template.bind({});

AddCropSale.args = {
  onSubmit: console.log,
  title: 'Add crop sale',
  currency: '$',
  view: 'add',
  handleGoBack: () => {},
  buttonText: 'Save',
  revenueTypes,
  persistedFormData: { revenue_type_id: 1 },
  revenueTypeOptions,
};

export const AddAnimalSale = Template.bind({});

AddAnimalSale.args = {
  onSubmit: console.log,
  title: 'Add animal sale',
  currency: '$',
  view: 'add',
  handleGoBack: () => {},
  buttonText: 'Save',
  revenueTypes,
  persistedFormData: { revenue_type_id: 3 },
  revenueTypeOptions,
};

export const AddGeneralSale = Template.bind({});

AddGeneralSale.args = {
  onSubmit: console.log,
  title: 'Add general sale',
  currency: '$',
  view: 'add',
  handleGoBack: () => {},
  buttonText: 'Save',
  revenueTypes,
  persistedFormData: { revenue_type_id: 2 },
  revenueTypeOptions,
};

export const GeneralSaleDetail = Template.bind({});

GeneralSaleDetail.args = {
  title: 'General sale detail',
  currency: '$',
  sale: generalSale,
  revenueTypeOptions,
  onRetire: () => {},
  revenueTypes,
};

export const CropSaleDetail = Template.bind({});
CropSaleDetail.args = {
  title: 'Crop sale detail',
  currency: '$',
  sale: cropSale,
  revenueTypeOptions,
  onRetire: () => {},
  revenueTypes,
  entitySaleDefaultValues: getEntityTypeDefaultValues(cropSale, 'crop', system),
};

export const AnimalSaleDetail = Template.bind({});
AnimalSaleDetail.args = {
  title: 'Animal sale detail',
  currency: '$',
  sale: animalSale,
  revenueTypeOptions,
  onRetire: () => {},
  revenueTypes,
  entitySaleDefaultValues: getEntityTypeDefaultValues(animalSale, 'animal', system),
};
