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
import React from 'react';
import { expect } from '@storybook/jest';
import { within } from '@storybook/testing-library';
import { componentDecorators } from '../Pages/config/Decorators';
import List from '../../components/List';
import { listItemTypes } from '../../components/List/constants';
import { ReactComponent as EquipIcon } from '../../assets/images/log/equipment.svg';
import { ReactComponent as SoilAmendmentIcon } from '../../assets/images/log/fertilizing.svg';
import { ReactComponent as PestIcon } from '../../assets/images/log/bug.svg';
import { ReactComponent as FuelIcon } from '../../assets/images/log/fuel.svg';
import { ReactComponent as MachineIcon } from '../../assets/images/log/machinery.svg';
import { ReactComponent as SeedIcon } from '../../assets/images/log/seeding.svg';
import { ReactComponent as OtherIcon } from '../../assets/images/log/other.svg';
import { ReactComponent as LandIcon } from '../../assets/images/log/land.svg';
import { ReactComponent as CropSaleIcon } from '../../assets/images/log/crop_sale.svg';
import { ReactComponent as CustomTypeIcon } from '../../assets/images/log/custom_revenue.svg';

export default {
  title: 'Components/List/List',
  component: List,
  decorators: componentDecorators,
};

const icons = {
  EQUIPMENT: <EquipIcon />,
  SOIL_AMENDMENT: <SoilAmendmentIcon />,
  PEST_CONTROL: <PestIcon />,
  FUEL: <FuelIcon />,
  MACHINERY: <MachineIcon />,
  SEEDS_AND_PLANTS: <SeedIcon />,
  OTHER: <OtherIcon />,
  LAND: <LandIcon />,
  UTILITIES: <OtherIcon />,
  LABOUR: <OtherIcon />,
  INFRASTRUCTURE: <OtherIcon />,
  TRANSPORTATION: <OtherIcon />,
  SERVICES: <OtherIcon />,
  CROP_SALE: <CropSaleIcon />,
  CUSTOM: <CustomTypeIcon />,
};

const expenseTypes = [
  {
    expense_name: 'Equipment',
    farm_id: null,
    expense_type_id: '1fd85a60-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'EQUIPMENT',
    custom_description:
      'Expenses related to simple tools, supplies, and parts for operating your farm.',
  },
  {
    expense_name: 'Fuel',
    farm_id: null,
    expense_type_id: '1fd86136-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'FUEL',
    custom_description:
      'Expenses related to the fuelling of infrastructure, vehicles, machinery, and equipment.',
  },
  {
    expense_name: 'Land',
    farm_id: null,
    expense_type_id: '1fd86168-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'LAND',
    custom_description:
      'Expenses related to the purchase, financing, lease, rental, access, tax, and other fees for land ownership or use.',
  },
  {
    expense_name: 'Machinery',
    farm_id: null,
    expense_type_id: '1fd86154-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'MACHINERY',
    custom_description:
      'Expenses related to the purchase, lease, rental, and maintenance of machinery.',
  },
  {
    expense_name: 'Pest Control',
    farm_id: null,
    expense_type_id: '1fd86118-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'PEST_CONTROL',
    custom_description:
      'Expenses related to the purchase of ingredients, products, and devices used to  manage unwanted species.',
  },
  {
    expense_name: 'Seeds and Plants',
    farm_id: null,
    expense_type_id: '1fd86186-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'SEEDS_AND_PLANTS',
    custom_description:
      'Purchases of seeds, starts, and seedlings used in planting and transplanting.',
  },
  {
    expense_name: 'Soil Amendment',
    farm_id: null,
    expense_type_id: '1fd8605a-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'SOIL_AMENDMENT',
    custom_description:
      'Expenses related to additives such as fertilizers that improve the attributes of your soil.',
  },
  {
    expense_name: 'Utilities',
    farm_id: null,
    expense_type_id: 'dbdbf7fe-6d2b-11ee-85e7-ce0b8496eaa9',
    deleted: false,
    expense_translation_key: 'UTILITIES',
    custom_description:
      'Recurring expenses related to electricity, gas, water (including irrigation), garbage collection, and other periodic services.',
  },
  {
    expense_name: 'Labour',
    farm_id: null,
    expense_type_id: 'dbdbfaba-6d2b-11ee-85e7-ce0b8496eaa9',
    deleted: false,
    expense_translation_key: 'LABOUR',
    custom_description: 'Expenses related to employed and contracted individuals.',
  },
  {
    expense_name: 'Infrastructure',
    farm_id: null,
    expense_type_id: 'dbdbfad8-6d2b-11ee-85e7-ce0b8496eaa9',
    deleted: false,
    expense_translation_key: 'INFRASTRUCTURE',
    custom_description: 'Expenses related to building or improving structures on the farm.',
  },
  {
    expense_name: 'Transportation',
    farm_id: null,
    expense_type_id: 'dbdbfaec-6d2b-11ee-85e7-ce0b8496eaa9',
    deleted: false,
    expense_translation_key: 'TRANSPORTATION',
    custom_description: 'Expenses related to moving inputs, outputs, and people.',
  },
  {
    expense_name: 'Services',
    farm_id: null,
    expense_type_id: 'dbdbfaf6-6d2b-11ee-85e7-ce0b8496eaa9',
    deleted: false,
    expense_translation_key: 'SERVICES',
    custom_description:
      'Expenses related to other services such as licensing, certification, agronomy support, testing, marketing, and others.',
  },
  {
    expense_name: 'New type',
    farm_id: '474069c6-22a9-11ee-a59f-e66db4bef552',
    expense_type_id: '461d2e5e-3d4c-11ee-ba15-e66db4bef552',
    deleted: false,
    expense_translation_key: 'NEW',
    custom_description: null,
  },
];

const revenueTypes = [
  {
    revenue_name: 'Crop sale',
    farm_id: null,
    revenue_type_id: '1fd85a60-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    revenue_translation_key: 'CROP_SALE',
    custom_description: 'Revenues associated with the sale of crops harvested from this farm.',
  },
  {
    revenue_name: 'Custom',
    farm_id: '474069c6-22a9-11ee-a59f-e66db4bef552',
    revenue_type_id: '1fd85a60-22a9-11ee-9683-e66db4bef553',
    deleted: false,
    revenue_translation_key: 'CUSTOM',
    custom_description: 'This a short description of the new type',
  },
];

export const IconDescriptionCheckboxListItemsAsChildren = {
  args: {
    listItemType: listItemTypes.ICON_DESCRIPTION_CHECKBOX,
    listItemData: expenseTypes.map((item, index) => {
      return {
        listItemKey: item.expense_type_id,
        icon: icons[item.farm_id ? 'OTHER' : item.expense_translation_key],
        label: item.expense_name,
        onClick: () => console.log('clicked!'),
        selected: false,
        description: item.custom_description,
      };
    }),
  },
};

export const IconDescriptionListItemsAsChildren = {
  args: {
    listItemType: listItemTypes.ICON_DESCRIPTION,
    listItemData: revenueTypes.map((item, index) => {
      return {
        listItemKey: item.revenue_type_id,
        icon: icons[item.farm_id ? 'CUSTOM' : item.revenue_translation_key],
        label: item.revenue_name,
        onClick: () => console.log('clicked!'),
        description: item.custom_description,
      };
    }),
  },
};
