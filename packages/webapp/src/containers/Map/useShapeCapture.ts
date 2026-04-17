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

import {
  TerraDraw,
  TerraDrawLineStringMode,
  TerraDrawPointMode,
  TerraDrawPolygonMode,
  TerraDrawRenderMode,
} from 'terra-draw';
import { TerraDrawGoogleMapsAdapter } from 'terra-draw-google-maps-adapter';
import { getTerraDrawModeConfig } from './terraDrawStyles';
import {
  terraFeatureToOverlay,
  type DrawnOverlay,
} from '../../util/google-maps/terraFeatureToOverlay';

export type ShapeCapture = {
  setMode: (locationType: string | null) => void;
  onFinish: (callback: (result: DrawnOverlay) => void) => void;
  destroy: () => void;
};

export const createShapeCapture = (
  map: google.maps.Map,
  maps: typeof google.maps,
): ShapeCapture => {
  const adapter = new TerraDrawGoogleMapsAdapter({ lib: maps, map });

  const draw = new TerraDraw({
    adapter,
    modes: [
      new TerraDrawPolygonMode(),
      new TerraDrawLineStringMode(),
      new TerraDrawPointMode(),
      new TerraDrawRenderMode({
        modeName: 'static',
        styles: {
          polygonFillOpacity: 0,
          polygonOutlineWidth: 0,
          lineStringWidth: 0,
          pointWidth: 0,
          pointOutlineWidth: 0,
        },
      }),
    ],
  });

  draw.start();
  draw.setMode('static');

  let finishCallback: ((result: DrawnOverlay) => void) | null = null;
  let currentLocationType: string | null = null;

  draw.on('finish', (id) => {
    const feature = draw.getSnapshotFeature(id);
    if (!feature || !currentLocationType) {
      return;
    }
    const result = terraFeatureToOverlay(feature, map, maps, currentLocationType);
    draw.clear();
    if (result && finishCallback) {
      finishCallback(result);
    }
  });

  const setMode = (locationType: string | null) => {
    if (locationType === null) {
      currentLocationType = null;
      draw.setMode('static');
      return;
    }
    currentLocationType = locationType;
    const config = getTerraDrawModeConfig(locationType);
    if (config.mode === 'polygon') {
      draw.updateModeOptions<typeof TerraDrawPolygonMode>('polygon', { styles: config.styles });
    } else if (config.mode === 'linestring') {
      draw.updateModeOptions<typeof TerraDrawLineStringMode>('linestring', {
        styles: config.styles,
      });
    } else {
      draw.updateModeOptions<typeof TerraDrawPointMode>('point', { styles: config.styles });
    }
    draw.setMode(config.mode);
  };

  return {
    setMode,
    onFinish: (cb) => {
      finishCallback = cb;
    },
    destroy: () => {
      draw.stop();
    },
  };
};
