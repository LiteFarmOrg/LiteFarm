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

// Define the Props
interface BadgeProps {
  content: string;
  title: string;
  showIcon?: boolean;
  style?: React.CSSProperties;
}

const Badge: React.FC<BadgeProps> = ({ content, title, showIcon = true, style }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [tooltipHover, setTooltipHover] = useState<boolean>(false);

  const handleTooltipOpen = () => {
    if (!tooltipHover) {
      setOpen(true);
    }
  };
  const handleTooltipClose = () => {
    if (!tooltipHover) {
      setOpen(false);
    }
  };
  const handleTooltipContentHover = (hovering: boolean) => {
    setTooltipHover(hovering);
    setOpen(hovering);
  };

  const tooltipContent = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        handleTooltipContentHover(true);
      }}
      onMouseEnter={() => handleTooltipContentHover(true)}
      onMouseLeave={() => handleTooltipContentHover(false)}
      className={styles.tooltip}
      dangerouslySetInnerHTML={{ __html: content }}
    />
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
        slotProps={slotProps}
      >
        <IconButton
          className={styles.badge}
          style={{ ...style }}
          onClick={(e) => {
            e.stopPropagation();
            handleTooltipOpen();
          }} // Toggle on click for both desktop and mobile
          onMouseEnter={handleTooltipOpen} // Show on hover (desktop)
        >
          <span>{title}</span> {showIcon && <InfoOutlinedIcon />}
        </IconButton>
      </Tooltip>
    </ClickAwayListener>
  );
};

export default Badge;
