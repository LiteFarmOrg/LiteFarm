/*
 *  Copyright 2024 LiteFarm.org
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

import React, { useState } from 'react';
import { Tooltip, ClickAwayListener, IconButton, tooltipClasses } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import styles from './styles.module.scss';
import clsx from 'clsx';

// Define the Props
export interface BadgeProps {
  title: string;
  content?: string | React.ReactElement;
  showIcon?: boolean;
  isMenuItem?: boolean;
  position?: 'left' | 'right';
  id?: string;
  classes?: {
    iconButton: string;
  };
}

const Badge: React.FC<BadgeProps> = ({
  title,
  content = '',
  showIcon = true,
  isMenuItem = false,
  position,
  id,
  classes,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [focus, setFocus] = useState<boolean>(false);

  const handleTooltipClick = (awayClicked?: boolean) => {
    if (awayClicked) {
      setOpen(false);
      setFocus(false);
    } else {
      setOpen((prevState) => {
        setFocus(!prevState);
        return !prevState;
      });
    }
  };

  const tooltipContent = (
    <div
      onClick={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className={styles.tooltip}
    >
      {content}
    </div>
  );
  const slotProps = {
    tooltip: {
      sx: {
        backgroundColor: '#fff',
        p: 0,
        m: 0,
      },
    },
    popper: {
      sx: {
        [`&.${tooltipClasses.popper}[data-popper-placement*="bottom"] .${tooltipClasses.tooltip}`]:
          {
            marginTop: '2px',
          },
      },
    },
  };

  return (
    <ClickAwayListener onClickAway={() => handleTooltipClick(true)}>
      <Tooltip
        title={tooltipContent}
        open={open}
        disableHoverListener
        disableFocusListener
        disableTouchListener
        enterTouchDelay={0}
        placement="bottom-start"
        slotProps={slotProps}
      >
        <IconButton
          id={id}
          className={clsx(
            styles.badge,
            focus && styles.focus,
            !isMenuItem && position && styles[position + 'Position'],
            isMenuItem && styles.menuItem,
            classes?.iconButton,
          )}
          onClick={(e) => {
            if (showIcon) {
              e.stopPropagation();
              handleTooltipClick();
            }
          }} // Toggle on click for both desktop and mobile
        >
          <span>{title}</span> {showIcon && <InfoOutlinedIcon />}
        </IconButton>
      </Tooltip>
    </ClickAwayListener>
  );
};

export default Badge;
