import React, { useRef, useState } from 'react';
import Button from '../Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { MdArrowDropDown } from 'react-icons/all';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  svg: {
    fontSize: '20px',
  },
  popper: {
    zIndex: 1600,
  },
}));

export default function DropdownButton({ options, children, defaultOpen }) {
  const classes = useStyles();
  const [isOpen, setOpen] = useState(defaultOpen);
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
      <Button sm onClick={handleToggle} inputRef={anchorRef}>
        {children}
        <MdArrowDropDown
          className={classes.svg}
          style={{ transform: `translateX(4px) scaleY(${isOpen ? -1 : 1})` }}
        />
      </Button>
      <Popper
        placement={'bottom-end'}
        open={isOpen}
        anchorEl={anchorRef.current}
        role={undefined}
        disablePortal
        className={classes.popper}
      >
        <Paper>
          <ClickAwayListener onClickAway={handleClose}>
            <MenuList>
              {options.map((option, index) => (
                <MenuItem key={index} onClick={(event) => handleMenuItemClick(option)}>
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
  children: PropTypes.string,
  defaultOpen: PropTypes.bool,
};
