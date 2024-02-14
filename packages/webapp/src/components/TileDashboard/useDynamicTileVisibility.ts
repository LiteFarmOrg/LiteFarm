/*
 *  Copyright 2024 LiteFarm.org
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

import { useState, useLayoutEffect, RefObject } from 'react';
import type { IconCountTile } from './index';

// Source: https://github.com/que-etc/resize-observer-polyfill
interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

interface useDynamicTileVisibilityParams {
  containerRef: RefObject<HTMLElement>;
  countTiles: IconCountTile[];
  gap?: number;
  tileWidth?: number;
  moreButtonWidth?: number;
  minWidthDesktop?: number;
  rowsPerView?: {
    desktop: number;
    mobile: number;
  };
}

export const useDynamicTileVisibility = ({
  containerRef,
  countTiles,
  gap = 4,
  tileWidth = 90,
  moreButtonWidth = 90,
  minWidthDesktop = 600,
  rowsPerView = { desktop: 1, mobile: 2 },
}: useDynamicTileVisibilityParams) => {
  const [visibleIconTiles, setVisibleIconTiles] = useState<IconCountTile[]>([]);
  const [hiddenIconTiles, setHiddenIconTiles] = useState<IconCountTile[]>([]);

  const totalTiles = countTiles.length;

  useLayoutEffect(() => {
    let resizeObserver: ResizeObserver;

    const updateLayout = (container: HTMLElement) => {
      if (container) {
        const containerWidth = container.getBoundingClientRect().width;
        let isDesktopView = containerWidth > minWidthDesktop;

        const rowMultiplier = isDesktopView ? rowsPerView.desktop : rowsPerView.mobile;

        const availableWidth = containerWidth - moreButtonWidth;
        const tilesPerRow = Math.floor(availableWidth / (tileWidth + gap));
        const totalFittableTiles = tilesPerRow * rowMultiplier;

        let tilesToHide = totalTiles - totalFittableTiles;
        if (tilesToHide < 0) tilesToHide = 0;

        setVisibleIconTiles(countTiles.slice(0, countTiles.length - tilesToHide));
        setHiddenIconTiles(countTiles.slice(countTiles.length - tilesToHide));
      }
    };

    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateLayout(containerRef.current!);
      });

      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return { visibleIconTiles, hiddenIconTiles };
};
