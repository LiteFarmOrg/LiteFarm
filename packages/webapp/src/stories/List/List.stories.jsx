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
import { ReactComponent as SoilAmendment } from '../../assets/images/task/SoilAmendment.svg';

export default {
  title: 'Components/List/List',
  component: List,
  decorators: componentDecorators,
};

const listItemLengthTest =
  (listLength, labelTexts) =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    let list = [];
    for (let i = 0; i < labelTexts.length; i++) {
      const label = labelTexts[i];
      const listItemsForLabel = await canvas.queryAllByText(label);
      list = list.concat(listItemsForLabel);
    }
    expect(list.length).toBe(listLength);
  };

export const IconDescriptionListTilesAsChildren = {
  args: {
    listItemType: listItemTypes.ICON_DESCRIPTION_CHECKBOX,
    listItemData: new Array(6).fill().map((item, index) => {
      return {
        key: index,
        icon: <SoilAmendment />,
        label: 'Label',
        onClick: () => console.log('clicked!'),
        selected: false,
        description:
          'Recurring expenses related to electricity, gas, water (including irrigation), garbage collection, and other periodic services.',
      };
    }),
  },
  play: listItemLengthTest(6, ['Label']),
};
