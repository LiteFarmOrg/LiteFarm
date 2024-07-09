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
import { useState } from 'react';
import PropTypes from 'prop-types';

export default function useExpandable({ defaultExpandedIds = [], isSingleExpandable } = {}) {
  const [expandedIds, setExpandedIds] = useState(defaultExpandedIds);

  const expand = (id) => {
    if (expandedIds.includes(id)) {
      return;
    }
    const newIds = isSingleExpandable ? [id] : [...expandedIds, id];
    setExpandedIds(newIds);
  };

  const unExpand = (id) => {
    if (!expandedIds.includes(id)) {
      return;
    }
    const newIds = isSingleExpandable ? [] : expandedIds.filter((expandedId) => id !== expandedId);
    setExpandedIds(newIds);
  };

  const toggleExpanded = (id) => {
    expandedIds.includes(id) ? unExpand(id) : expand(id);
  };

  const resetExpanded = () => {
    setExpandedIds(defaultExpandedIds);
  };

  return { expandedIds, expand, unExpand, toggleExpanded, resetExpanded };
}

useExpandable.propTypes = {
  defaultExpandedIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  isSingleExpandable: PropTypes.bool,
};
