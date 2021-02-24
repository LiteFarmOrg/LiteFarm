import React, { useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { MdArrowDropDown } from 'react-icons/all';
import PropTypes from 'prop-types';

export default function DropdownButton({ options }) {
  const [isOpen, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleMenuItemClick = (option) => {
    option.onClick();
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        color="primary"
        size="small"
        aria-controls={isOpen ? 'split-button-menu' : undefined}
        aria-expanded={isOpen ? 'true' : undefined}
        aria-label="select action"
        aria-haspopup="menu"
        onClick={handleToggle}
      >
        <MdArrowDropDown />
      </Button>
      <Popper open={isOpen} anchorEl={anchorRef.current} role={undefined} disablePortal>
        <Paper>
          <ClickAwayListener onClickAway={handleClose}>
            <MenuList>
              {options.map((option, index) => (
                <MenuItem key={option} onClick={(event) => handleMenuItemClick(option)}>
                  {option.text}
                </MenuItem>
              ))}
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  );
}

DropdownButton.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.exact({
      text: PropTypes.string,
      onClick: PropTypes.func,
    }),
  ),
};
