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
import TransactionItem from '../../../../components/Finances/Transaction/Mobile/Item';
import { componentDecorators } from '../../config/Decorators';

export default {
  title: 'Page/Finance/Transactions/TransactionItem',
  component: TransactionItem,
  decorators: componentDecorators,
};

const generateExpenseArgs = (key) => {
  return {
    transaction: key,
    type: key.replaceAll('_', ' ').toLowerCase(),
    amount: -873.0,
    iconKey: key,
    currencySymbol: '€',
  };
};

export const CropSale = {
  args: {
    transaction: 'Summer Harvest',
    type: 'Crop sales',
    amount: +17551.5,
    iconKey: 'CROP_SALE',
    currencySymbol: '€',
  },
};

export const CustomRevenue = {
  args: {
    transaction: 'Custom Revenue',
    type: 'Custom',
    amount: +17551.5,
    iconKey: 'CUSTOM',
    currencySymbol: '€',
  },
};

export const Equipment = {
  args: generateExpenseArgs('EQUIPMENT'),
};
export const SoilAmendment = {
  args: generateExpenseArgs('SOIL_AMENDMENT'),
};

export const PestControl = {
  args: generateExpenseArgs('PEST_CONTROL'),
};

export const Fuel = {
  args: generateExpenseArgs('FUEL'),
};

export const Machinery = {
  args: generateExpenseArgs('MACHINERY'),
};

export const SeedsAndPlants = {
  args: generateExpenseArgs('SEEDS_AND_PLANTS'),
};

export const Land = {
  args: generateExpenseArgs('LAND'),
};

export const Miscellaneous = {
  args: generateExpenseArgs('MISCELLANEOUS'),
};

export const Utilities = {
  args: generateExpenseArgs('UTILITIES'),
};

export const Labour = {
  args: generateExpenseArgs('LABOUR'),
};

export const Infrastructure = {
  args: generateExpenseArgs('INFRASTRUCTURE'),
};

export const Transportation = {
  args: generateExpenseArgs('TRANSPORTATION'),
};

export const Services = {
  args: generateExpenseArgs('SERVICES'),
};

export const CustomExpense = {
  args: generateExpenseArgs('OTHER'),
};
