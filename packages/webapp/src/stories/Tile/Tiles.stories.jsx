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
import Tiles from '../../components/Tile/Tiles';
import IconLabelTile from '../../components/Tile/IconLabelTile';
import { tileTypes } from '../../components/Tile/constants';
import { ReactComponent as SoilAmendment } from '../../assets/images/task/SoilAmendment.svg';

export default {
  title: 'Components/Tile/Tiles',
  component: Tiles,
  decorators: componentDecorators,
};

const tileLengthTest =
  (tileLength, labelTexts) =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    let tiles = [];
    for (let i = 0; i < labelTexts.length; i++) {
      const label = labelTexts[i];
      const tilesForLabel = await canvas.queryAllByText(label);
      tiles = tiles.concat(tilesForLabel);
    }
    expect(tiles.length).toBe(tileLength);
  };

export const IconLabeTilesAsChildren = {
  args: {
    children: new Array(6).fill().map((item, index) => {
      return (
        <IconLabelTile
          key={index}
          icon={<SoilAmendment />}
          label={'Label'}
          onClick={() => console.log('clicked!')}
          selected={false}
        />
      );
    }),
  },
  play: tileLengthTest(6, ['Label']),
};

export const IconLabelTilesAsData = {
  args: {
    tileType: tileTypes.ICON_LABEL,
    tileData: new Array(6).fill().map((item, index) => {
      return {
        key: index,
        icon: <SoilAmendment />,
        label: 'Label',
        onClick: () => console.log('clicked!'),
        selected: false,
      };
    }),
  },
  play: tileLengthTest(6, ['Label']),
};

export const IconLabelTilesAsDataWithFormatFunction = {
  args: {
    tileType: tileTypes.ICON_LABEL,
    tileData: new Array(6).fill().map((item, index) => {
      return {
        index,
        svg: <SoilAmendment />,
        type: 'Label',
      };
    }),
    formatTileData: (data) => {
      const exampleSelectedIndex = 8;
      const { index, svg, type } = data;

      return {
        key: index.toString(),
        tileKey: index.toString(),
        icon: svg,
        label: type,
        onClick: () => console.log(`${index} clicked!`),
        selected: exampleSelectedIndex === index,
      };
    },
  },
  play: tileLengthTest(6, ['Label']),
};
