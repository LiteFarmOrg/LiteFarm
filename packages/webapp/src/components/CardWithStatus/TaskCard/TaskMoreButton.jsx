import React from 'react';
import { useSelector } from 'react-redux';
import { MdMoreHoriz } from 'react-icons/md';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import { Menu } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '../../Form/Button';
import { colors } from '../../../assets/theme';
import { stopEventPropagation } from '../../../util/stopEventPropagation.js';
import { isAdminSelector } from '../../../containers/userFarmSlice.js';

export const TaskMoreButton = ({ pinned, onPin, onUnpin }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isAdmin = useSelector(isAdminSelector);
  const open = Boolean(anchorEl);

  if (!isAdmin) return null;

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const closeAfterAction = (action) => () => {
    action();
    handleClose();
  };

  return (
    <span onClick={stopEventPropagation}>
      <MoreButton onClick={handleOpen}>
        <MdMoreHoriz />
      </MoreButton>
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        {pinned ? (
          <MenuItem onClick={closeAfterAction(onUnpin)}>
            Unpin <BsPinAngle style={{ marginLeft: '0.5em' }} />
          </MenuItem>
        ) : (
          <MenuItem onClick={closeAfterAction(onPin)}>
            Pin <BsPinAngleFill style={{ marginLeft: '0.5em' }} fill={colors.teal900} />
          </MenuItem>
        )}
      </Menu>
    </span>
  );
};

const MoreButton = ({ children, onClick }) => (
  <Button
    color="secondary"
    onClick={onClick}
    style={{
      display: 'inline',
      paddingLeft: '0.5em',
      paddingRight: '0.5em',
      minHeight: '1.2em',
      height: '1.2em',
      verticalAlign: 'middle',
      backgroundColor: colors.grey400,
      fontWeight: 'bolder',
      marginLeft: '0.5em',
      border: 'none',
      color: 'black',
      ariaHaspopup: 'true',
    }}
  >
    {children}
  </Button>
);
