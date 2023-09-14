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
import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import IconLabelTile from './IconLabelTile';
import { tileTypes } from './constants';
import styles from './styles.module.scss';

const tileComponents = {
  [tileTypes.ICON_LABEL]: (props) => <IconLabelTile {...props} />,
};

/**
 * A component that places tiles so that the empty space is evenly distributed for any window sizes.
 * Either "children" or "tileType" and "tileData" props are required.
 * If maxSwipeableWidth is given, tiles will be swipeable when the browser size is less than or equal to maxSwipeableWidth.
 * See packages/webapp/src/stories/Tile/Tiles.stories.jsx for examples.
 */
export default function Tiles({
  children,
  tileType,
  tileData,
  formatTileData,
  maxSwipeableWidth,
  ...props
}) {
  const queryToMatch = maxSwipeableWidth ? `(max-width: ${maxSwipeableWidth}px)` : '';
  const [isSwipeableView, setIsSwipeableView] = useState(
    maxSwipeableWidth ? window.matchMedia(queryToMatch).matches : false,
  );

  useEffect(() => {
    if (!maxSwipeableWidth) {
      return;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
    const media = window.matchMedia(queryToMatch);

    if (media.matches !== isSwipeableView) {
      setIsSwipeableView(media.matches);
    }

    const listner = () => {
      setIsSwipeableView(media.matches);
    };

    // listen browser size change and set isSwipeableView to true if window width <= maxSwipeableWidth
    media.addEventListener('change', listner);

    return () => media.removeEventListener('change', listner);
  }, [maxSwipeableWidth]);

  const tiles = useMemo(() => {
    if (children || !tileType || !tileData) {
      return children || null;
    }

    return tileData.map((data) => {
      const tileProps = formatTileData ? formatTileData(data) : data;
      return tileComponents[tileType](tileProps);
    });
  }, [children, tileType, tileData, formatTileData]);

  return (
    <div className={styles.tilesWrapper}>
      <div className={clsx(styles.matrixContainer, isSwipeableView && styles.swipeable)} {...props}>
        {tiles}
      </div>
    </div>
  );
}

Tiles.propTypes = {
  children: PropTypes.node,
  tileType: PropTypes.oneOf(Object.keys(tileComponents)),
  tileData: PropTypes.array,
  /* formatTileData must return an object that has "key" */
  formatTileData: PropTypes.func,
  maxSwipeableWidth: PropTypes.number,
};
