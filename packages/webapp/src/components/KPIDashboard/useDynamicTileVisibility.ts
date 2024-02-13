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

// Source: https://github.com/que-etc/resize-observer-polyfill
interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

interface useDynamicTileVisibilityParams {
  containerRef: RefObject<HTMLElement>;
  gap: number;
  moreButtonWidth: number;
  minWidthDesktop: number;
  totalTiles: number;
  rowsPerView: {
    desktop: number;
    mobile: number;
  };
}

export const useDynamicTileVisibility = ({
  containerRef,
  gap,
  moreButtonWidth,
  minWidthDesktop,
  totalTiles,
  rowsPerView,
}: useDynamicTileVisibilityParams) => {
  const [hiddenThreshold, setHiddenThreshold] = useState(0);

  useLayoutEffect(() => {
    let resizeObserver: ResizeObserver;
    let tileWidths: number[] = [];

    const updateLayout = (container: HTMLElement) => {
      if (container) {
        const containerRect = container.getBoundingClientRect();

        let totalWidth = 0;
        let willFit = 0;
        let spaceRemaining = 0;

        let isDesktopView = containerRect.width > minWidthDesktop;

        if (isDesktopView) {
          setHiddenThreshold(0);
        }

        const tiles = Array.from(container.children);

        if (!tileWidths.length) {
          tileWidths = Array.from(tiles).map((tile, index) => {
            const tileRect = tile.getBoundingClientRect();

            return tileRect.width + (index > 0 ? gap : 0);
          });
        }

        const rowMultiplier = isDesktopView ? rowsPerView.desktop : rowsPerView.mobile;

        tileWidths.forEach((width) => {
          if (totalWidth + width > containerRect.width * rowMultiplier) {
            spaceRemaining = containerRect.width * rowMultiplier - totalWidth;
            return;
          } else {
            totalWidth += width;
            willFit++;
          }
        });

        let breakpoint = totalTiles - willFit;

        if (spaceRemaining < moreButtonWidth) {
          breakpoint += rowMultiplier;
        }

        setHiddenThreshold(breakpoint);
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

  return hiddenThreshold;
};
