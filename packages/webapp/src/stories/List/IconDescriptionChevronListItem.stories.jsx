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
import IconDescriptionListItem from '../../components/List/ListItems/IconDescription/IconDescriptionListItem';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/List/IconDescriptionChevronListItem',
  component: IconDescriptionListItem,
  decorators: componentDecorators,
};

export const Default = {
  args: {
    actionIcon: 'chevron',
    listItemKey: 'key',
    iconName: 'SOIL_AMENDMENT_TASK',
    label: 'Utilities',
    onClick: () => console.log('clicked!'),
    description:
      'Recurring expenses related to electricity, gas, water (including irrigation), garbage collection, and other periodic services.',
  },
};

//Max chars currently sits at 100 for label and 125 on SimpleCustomType form
export const SimpleCustomTypeMaxCharText = {
  args: {
    actionIcon: 'chevron',
    listItemKey: 'key',
    iconName: 'SOIL_AMENDMENT_TASK',
    label:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus pellentesque metus nec neque sed.',
    onClick: () => console.log('clicked!'),
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque eu urna laoreet, hendrerit tortor a, cursus mauris accumsan.',
  },
};

export const NoDescription = {
  args: {
    actionIcon: 'chevron',
    listItemKey: 'key',
    iconName: 'SOIL_AMENDMENT_TASK',
    label: 'Utilites',
    onClick: () => console.log('clicked!'),
  },
};
