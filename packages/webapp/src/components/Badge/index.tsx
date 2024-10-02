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
import { Tooltip, ClickAwayListener, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import styles from './styles.module.scss';

// Define the Props
interface BadgeProps {
  content: React.ReactNode;
  title: string;
  showIcon?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ content, title = 'Beta', showIcon = true }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [tooltipHover, setTooltipHover] = useState<boolean>(false);

  const handleTooltipOpen = () => {
    if (!tooltipHover) setOpen(true);
  };
  const handleTooltipClose = () => {
    if (!tooltipHover) setOpen(false);
  };
  const handleTooltipContentHover = (hovering: boolean) => {
    setTooltipHover(hovering);
    setOpen(hovering);
  };

  const tooltipContent = (
    <div
      onClick={() => handleTooltipContentHover(true)}
      onMouseEnter={() => handleTooltipContentHover(true)}
      onMouseLeave={() => handleTooltipContentHover(false)}
      className={styles.tooltip}
    >
      {content}
    </div>
  );

  const popperProps = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, -10],
        },
      },
    ],
  };
  const componentsProps = {
    tooltip: {
      sx: {
        backgroundColor: '#fff',
        p: 0,
        m: 0,
      },
    },
  };

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <Tooltip
        title={tooltipContent}
        open={open}
        onClose={handleTooltipClose}
        disableHoverListener={false} // Keep hover for desktop
        disableFocusListener
        disableTouchListener
        enterTouchDelay={0}
        placement="bottom-start"
        PopperProps={popperProps}
        componentsProps={componentsProps}
      >
        <IconButton
          className={styles.badge}
          onClick={handleTooltipOpen} // Toggle on click for both desktop and mobile
          onMouseEnter={handleTooltipOpen} // Show on hover (desktop)
        >
          <span>{title}</span> {showIcon && <InfoOutlinedIcon />}
        </IconButton>
      </Tooltip>
    </ClickAwayListener>
  );
};

export default Badge;
