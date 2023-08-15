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
import { useSelector } from 'react-redux';
import { MdMoreHoriz } from 'react-icons/md';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import { Menu } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '../../Form/Button';
import { colors } from '../../../assets/theme';
import { stopEventPropagation } from '../../../util/stopEventPropagation';
// @ts-ignore until userFarmSlice is migrated to TypeScript
import { isAdminSelector } from '../../../containers/userFarmSlice.js';

interface Props {
  pinned: boolean;
  onPin: () => void;
  onUnpin: () => void;
}

export const TaskMoreButton = ({ pinned, onPin, onUnpin }: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const isAdmin = useSelector(isAdminSelector);
  const open = Boolean(anchorEl);

  if (!isAdmin) return null;

  const handleOpen = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const closeAfterAction = (action: () => void) => () => {
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

const MoreButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: React.ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
}) => (
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
    }}
    aria-haspopup="true"
  >
    {children}
  </Button>
);
