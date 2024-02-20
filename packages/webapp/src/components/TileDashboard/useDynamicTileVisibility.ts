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
import type { TypeCountTile } from './index';

// Source: https://github.com/que-etc/resize-observer-polyfill
interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

interface useDynamicTileVisibilityParams {
  containerRef: RefObject<HTMLElement>;
  typeCountTiles: TypeCountTile[];
  gap?: number;
  tileWidth?: number; // & more Button width
  minWidthDesktop?: number;
  rowsPerView?: {
    desktop: number;
    mobile: number;
  };
}

export const useDynamicTileVisibility = ({
  containerRef,
  typeCountTiles,
  gap = 4,
  tileWidth = 90, // & more Button width
  minWidthDesktop = 600,
  rowsPerView = { desktop: 1, mobile: 2 },
}: useDynamicTileVisibilityParams) => {
  const [visibleIconTiles, setVisibleIconTiles] = useState<TypeCountTile[]>([]);
  const [hiddenIconTiles, setHiddenIconTiles] = useState<TypeCountTile[]>([]);

  useLayoutEffect(() => {
    let resizeObserver: ResizeObserver;
    const totalTiles = typeCountTiles.length;

    const updateLayout = (container: HTMLElement) => {
      const containerWidth = container.getBoundingClientRect().width;
      const isDesktopView = containerWidth >= minWidthDesktop;

      const rowMultiplier = isDesktopView ? rowsPerView.desktop : rowsPerView.mobile;

      const tilesPerRow = Math.floor(containerWidth / (tileWidth + gap));
      const totalFittableTiles = tilesPerRow * rowMultiplier;

      let tilesToHide = Math.max(totalTiles - totalFittableTiles, 0);

      // Reserve space for the more button
      if (tilesToHide > 0) {
        tilesToHide++;
      }

      setVisibleIconTiles(typeCountTiles.slice(0, typeCountTiles.length - tilesToHide));
      setHiddenIconTiles(typeCountTiles.slice(typeCountTiles.length - tilesToHide));
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
