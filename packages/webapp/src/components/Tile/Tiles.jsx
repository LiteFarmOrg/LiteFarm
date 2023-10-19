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
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import IconLabelTile from './IconLabelTile';
import IconDescriptionListTile from './IconDescriptionListTile';
import { tileTypes } from './constants';
import styles from './styles.module.scss';

const tileComponents = {
  [tileTypes.ICON_LABEL]: (props) => <IconLabelTile {...props} />,
  [tileTypes.ICON_DESCRIPTION_LIST]: (props) => <IconDescriptionListTile {...props} />,
};

/**
 * A component that places tiles so that the empty space is evenly distributed for any window sizes.
 * Either "children" or "tileType" and "tileData" props are required.
 * See packages/webapp/src/stories/Tile/Tiles.stories.jsx for examples.
 */
export default function Tiles({ children, tileType, tileData, formatTileData, ...props }) {
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
    <div className={styles.matrixContainer} {...props}>
      {tiles}
    </div>
  );
}

Tiles.propTypes = {
  children: PropTypes.node,
  tileType: PropTypes.oneOf(Object.keys(tileComponents)),
  tileData: PropTypes.array,
  /* formatTileData must return an object that has "key" */
  formatTileData: PropTypes.func,
};
