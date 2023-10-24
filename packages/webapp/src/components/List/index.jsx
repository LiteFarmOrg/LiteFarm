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
import IconDescriptionCheckboxListItem from './ListItems/IconDescriptionCheckbox/IconDescriptionCheckboxListItem';
import { listItemTypes } from './constants';
import styles from './styles.module.scss';

const listItemComponents = {
  [listItemTypes.ICON_DESCRIPTION_CHECKBOX]: (props) => (
    <IconDescriptionCheckboxListItem {...props} />
  ),
};

/**
 * A component that places list items.
 * Either "children" or "listItemType" and "listItemData" props are required.
 * See packages/webapp/src/stories/List/List.stories.jsx for examples.
 */
export default function List({
  children,
  listItemType,
  listItemData,
  formatListItemData,
  ...props
}) {
  const listItems = useMemo(() => {
    if (children || !listItemType || !listItemData) {
      return children || null;
    }

    return listItemData.map((data) => {
      const listItemProps = formatListItemData ? formatListItemData(data) : data;
      return listItemComponents[listItemType](listItemProps);
    });
  }, [children, listItemType, listItemData, formatListItemData]);

  return (
    <ul className={styles.list} {...props}>
      {listItems}
    </ul>
  );
}

List.propTypes = {
  children: PropTypes.node,
  listItemType: PropTypes.oneOf(Object.keys(listItemComponents)),
  listItemData: PropTypes.array,
  /* formatListItemData must return an object that has "key" */
  formatListItemData: PropTypes.func,
};
