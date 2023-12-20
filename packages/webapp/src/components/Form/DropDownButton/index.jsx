import { useRef, useState } from 'react';
import clsx from 'clsx';
import Button from '../Button';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { MdArrowDropDown } from 'react-icons/md';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import styles from './styles.module.scss';

const useStyles = makeStyles((theme) => ({
  svg: {
    fontSize: '20px',
  },
  popper: {
    zIndex: 1600,
  },
}));

export default function DropdownButton({
  options,
  children,
  defaultOpen = false,
  noIcon,
  Menu,
  type,
  classes: propClasses = {},
}) {
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

  const menuProps = {
    autoFocusItem: isOpen,
    id: 'composition-menu',
    'aria-labelledby': 'composition-button',
  };

  return (
    <>
      <Button
        sm
        onClick={handleToggle}
        inputRef={anchorRef}
        className={clsx(type && styles[type], propClasses.button)}
        id="composition-button"
        aria-controls={open ? 'composition-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
      >
        {children}
        {!noIcon && (
          <MdArrowDropDown
            className={classes.svg}
            style={{ transform: `translateX(4px) scaleY(${isOpen ? -1 : 1})` }}
          />
        )}
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
            {Menu ? (
              <Menu {...menuProps} />
            ) : (
              <MenuList {...menuProps}>
                {options.map((option, index) => (
                  <MenuItem key={index} onClick={(event) => handleMenuItemClick(option)}>
                    {option.text}
                  </MenuItem>
                ))}
              </MenuList>
            )}
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
  noIcon: PropTypes.bool,
  Menu: PropTypes.elementType,
  type: PropTypes.oneOf(['v2']),
  classes: PropTypes.shape({
    button: PropTypes.string,
  }),
};
