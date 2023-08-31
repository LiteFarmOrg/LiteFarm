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
import IconLabelTile from '../../components/Tile/IconLabelTile';
import { componentDecorators } from '../Pages/config/Decorators';
import { ReactComponent as SoilAmendment } from '../../assets/images/task/SoilAmendment.svg';

export default {
  title: 'Components/Tile/IconLabelTile',
  component: IconLabelTile,
  decorators: componentDecorators,
};

export const Default = {
  args: {
    tileKey: 'key',
    icon: <SoilAmendment />,
    label: 'Label',
    onClick: () => console.log('clicked!'),
    selected: false,
  },
};

export const Selected = {
  args: {
    tileKey: 'key',
    icon: <SoilAmendment />,
    label: 'Label',
    onClick: () => console.log('clicked!'),
    selected: true,
  },
};
