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
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import FloatingActionButton from '../../Button/FloatingActionButton';
import FloatingMenu from './FloatingMenu';
import styles from './styles.module.scss';

const getDefaultTransformOrigin = (menuPlacement) => {
  const defaultTransformOrigin = {
    'top-end': 'bottom right',
    'bottom-start': 'left top',
  };
  return defaultTransformOrigin[menuPlacement] || 'left bottom';
};

export default function FloatingButtonMenu({
  type,
  options,
  menuPlacement = 'top-end',
  transformOrigin,
  Menu,
  classes = {},
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const menuProps = {
    autoFocusItem: open,
    id: 'composition-menu',
    'aria-labelledby': 'composition-button',
  };

  return (
    <div className={clsx(styles.buttonWrapper, classes.button)}>
      <FloatingActionButton
        ref={anchorRef}
        id="composition-button"
        aria-controls={open ? 'composition-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        type={type}
      />
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement={menuPlacement}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: transformOrigin || getDefaultTransformOrigin(placement) }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                {Menu ? <Menu {...menuProps} /> : <FloatingMenu {...menuProps} options={options} />}
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
}

FloatingButtonMenu.propTypes = {
  type: PropTypes.oneOf(['add']),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      onClick: PropTypes.func,
    }),
  ),
  menuPlacement: PropTypes.oneOf(['top-end', 'bottom-start']),
  transformOrigin: PropTypes.oneOf(['bottom right', 'left top', 'left bottom']),
  Menu: PropTypes.elementType,
};
