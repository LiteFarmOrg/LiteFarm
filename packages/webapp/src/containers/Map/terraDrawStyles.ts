/*
 *  Copyright 2026 LiteFarm.org
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

import type { HexColor } from 'terra-draw';
import { areaStyles, lineStyles } from './mapStyles';
import { isArea, isLine } from './constants';

type PolygonConfig = {
  mode: 'polygon';
  styles: {
    fillColor: HexColor;
    fillOpacity: number;
    outlineColor: HexColor;
    outlineWidth: number;
  };
};

type LineStringConfig = {
  mode: 'linestring';
  styles: {
    lineStringColor: HexColor;
    lineStringWidth: number;
  };
};

type PointConfig = {
  mode: 'point';
};

export type TerraDrawModeConfig = PolygonConfig | LineStringConfig | PointConfig;

const FALLBACK_COLOUR: HexColor = '#000000';

const asHexColor = (value: unknown): HexColor => {
  return typeof value === 'string' && value.startsWith('#') ? (value as HexColor) : FALLBACK_COLOUR;
};

export const getTerraDrawModeConfig = (locationType: string): TerraDrawModeConfig => {
  if (isArea(locationType)) {
    const colour = asHexColor(
      (areaStyles as Record<string, { colour?: string } | undefined>)[locationType]?.colour,
    );
    return {
      mode: 'polygon',
      styles: {
        fillColor: colour,
        fillOpacity: 0.3,
        outlineColor: colour,
        outlineWidth: 2,
      },
    };
  }

  if (isLine(locationType)) {
    const colour = asHexColor(
      (lineStyles as Record<string, { colour?: string } | undefined>)[locationType]?.colour,
    );
    return {
      mode: 'linestring',
      styles: {
        lineStringColor: colour,
        lineStringWidth: 2,
      },
    };
  }

  return {
    mode: 'point',
  };
};
