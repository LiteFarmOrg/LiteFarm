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
import IconDescriptionCheckboxListItem from '../../components/List/ListItems/IconDescriptionCheckbox/IconDescriptionCheckboxListItem';
import { componentDecorators } from '../Pages/config/Decorators';
import { ReactComponent as SoilAmendment } from '../../assets/images/task/SoilAmendment.svg';

export default {
  title: 'Components/List/IconDescriptionCheckboxListItem',
  component: IconDescriptionCheckboxListItem,
  decorators: componentDecorators,
};

export const Default = {
  args: {
    listItemKey: 'key',
    icon: <SoilAmendment />,
    label: 'Utilities',
    onClick: () => console.log('clicked!'),
    selected: false,
    description:
      'Recurring expenses related to electricity, gas, water (including irrigation), garbage collection, and other periodic services.',
  },
};

export const Selected = {
  args: {
    listItemKey: 'key',
    icon: <SoilAmendment />,
    label: 'Utilities',
    onClick: () => console.log('clicked!'),
    selected: true,
    description:
      'Recurring expenses related to electricity, gas, water (including irrigation), garbage collection, and other periodic services.',
  },
};

export const MaxCharText = {
  args: {
    listItemKey: 'key',
    icon: <SoilAmendment />,
    label:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus pellentesque metus nec neque sed.',
    onClick: () => console.log('clicked!'),
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut ornare eros. Nunc quis faucibus libero. Phasellus sodales porta auctor. Nulla feugiat ligula enim, sit amet posuere ex vestibulum eget. Praesent non augue vel ante lacinia sodales in et morbi.',
  },
};

export const NoDescription = {
  args: {
    listItemKey: 'key',
    icon: <SoilAmendment />,
    label: 'Utilites',
    onClick: () => console.log('clicked!'),
  },
};
