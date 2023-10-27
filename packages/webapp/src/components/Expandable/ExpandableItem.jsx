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
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Collapse } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import styles from './styles.module.scss';

const icons = {
  up: <KeyboardArrowUpIcon className={styles.icon} />,
  down: <KeyboardArrowDownIcon className={styles.icon} />,
};

export default function ExpandableItem({
  isExpanded,
  onClick,
  mainContent,
  expandedContent,
  iconClickOnly = true,
  classes = {},
  itemKey,
}) {
  const onElementClick = () => {
    if (!iconClickOnly) {
      onClick();
    }
  };

  const onIconClick = () => {
    if (iconClickOnly) {
      onClick();
    }
  };

  const id = `expanded-content-${itemKey}`;

  return (
    <>
      <div
        className={clsx(
          styles.mainContentWithIcon,
          !iconClickOnly && styles.clickable,
          classes.mainContentWithIcon,
        )}
        onClick={onElementClick}
        aria-controls={id}
        aria-expanded={isExpanded}
      >
        <div className={clsx(styles.mainContentWrapper, classes.mainContentWrapper)}>
          {mainContent}
        </div>
        <div
          onClick={onIconClick}
          className={clsx(styles.iconWrapper, iconClickOnly && styles.clickable, classes.icon)}
        >
          {icons[isExpanded ? 'up' : 'down']}
        </div>
      </div>
      <Collapse id={id} in={isExpanded} timeout="auto" unmountOnExit>
        {expandedContent}
      </Collapse>
    </>
  );
}

ExpandableItem.propTypes = {
  isExpanded: PropTypes.bool,
  onClick: PropTypes.func,
  mainContent: PropTypes.node,
  expandedContent: PropTypes.node,
  iconClickOnly: PropTypes.bool,
  classes: PropTypes.shape({
    mainContentWithIcon: PropTypes.string,
    icon: PropTypes.string,
  }),
  key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
