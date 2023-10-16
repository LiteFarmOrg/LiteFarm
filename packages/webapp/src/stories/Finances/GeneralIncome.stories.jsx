/*
 *  Copyright 2023 LiteFarm.org
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
import GeneralRevenue from '../../components/Forms/GeneralRevenue';
import { componentDecorators } from '../Pages/config/Decorators';
import React, { useState } from 'react';
import {
  useCropSaleInputs,
  getCustomFormChildrenDefaultValues,
} from '../../containers/Finances/useCropSaleInputs';

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

const revenueTypes = [
  {
    revenue_type_id: 1,
    revenue_name: 'Crop Sale',
    revenue_translation_key: 'CROP_SALE',
    farm_id: null,
    deleted: false,
    crop_generated: true,
  },
  {
    revenue_type_id: 2,
    revenue_name: 'General Sale',
    revenue_translation_key: 'GENERAL_SALE',
    farm_id: 1,
    deleted: false,
    crop_generated: false,
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
];

const GeneralRevenueWithState = (props) => {
  const { view, sale, revenueType } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [selectedRevenueType, setSelectedRevenueType] = useState(revenueType);

  const onTypeChange = (typeId, setValue, REVENUE_TYPE_ID) => {
    const newType = revenueTypes.find((option) => option.value === typeId);
    setValue(REVENUE_TYPE_ID, newType);
    const newRevenueType = revenueTypes.find((type) => type.revenue_type_id === typeId);
    setSelectedRevenueType(newRevenueType);
  };
  if (view === 'add') {
    return <GeneralRevenue {...props} />;
  } else {
    return (
      <GeneralRevenue
        key={isEditing ? 'editing' : 'readonly'}
        onSubmit={isEditing ? console.log : undefined}
        view={isEditing ? 'edit' : 'read-only'}
        handleGoBack={isEditing ? () => setIsEditing(false) : () => {}}
        onClick={isEditing ? undefined : () => setIsEditing(true)}
        buttonText={isEditing ? 'Save' : 'Edit'}
        useCustomFormChildren={useCropSaleInputs}
        customFormChildrenDefaultValues={
          selectedRevenueType.crop_generated ? getCustomFormChildrenDefaultValues(sale) : undefined
        }
        onTypeChange={onTypeChange}
        revenueType={selectedRevenueType}
        {...props}
      />
    );
  }
};

export default {
  title: 'Components/GeneralRevenue',
  component: GeneralRevenueWithState,
  decorators: componentDecorators,
};

const Template = (args) => <GeneralRevenueWithState {...args} />;

export const AddCropSale = Template.bind({});

AddCropSale.args = {
  onSubmit: console.log,
  title: 'Add crop sale',
  dateLabel: 'Date',
  //useHookFormPersist: () => ({}),
  currency: '$',
  useCustomFormChildren: useCropSaleInputs,
  view: 'add',
  handleGoBack: () => {},
  buttonText: 'Save',
  revenueType: revenueTypes[0],
  revenueTypes,
  persistedFormData: { revenue_type_id: 1 },
  revenueTypeOptions,
};

export const AddGeneralSale = Template.bind({});

AddGeneralSale.args = {
  onSubmit: console.log,
  title: 'Add general sale',
  dateLabel: 'Date',
  //useHookFormPersist: () => ({}),
  currency: '$',
  view: 'add',
  handleGoBack: () => {},
  buttonText: 'Save',
  revenueType: revenueTypes[1],
  revenueTypes,
  persistedFormData: { revenue_type_id: 2 },
  revenueTypeOptions,
};

export const DetailGeneralSale = Template.bind({});

DetailGeneralSale.args = {
  title: 'General sale detail',
  dateLabel: 'Date',
  //useHookFormPersist: () => ({}),
  currency: '$',
  sale: generalSale,
  revenueTypeOptions,
  onRetire: () => {},
  revenueType: revenueTypes[1],
  revenueTypes,
};

export const DetailCropSale = Template.bind({});
DetailCropSale.args = {
  title: 'General sale detail',
  dateLabel: 'Date',
  //useHookFormPersist: () => ({}),
  currency: '$',
  sale: cropSale,
  revenueTypeOptions,
  onRetire: () => {},
  revenueType: revenueTypes[0],
  revenueTypes,
};
