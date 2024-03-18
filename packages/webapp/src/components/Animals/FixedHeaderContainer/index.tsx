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

import React, { ReactElement, ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Paper, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/styles';
import { sumObjectValues } from '../../../util';
import styles from './styles.module.scss';

const globalNavbarHeight = {
  mobile: 56,
  desktop: 64,
};

const heights = {
  mobile: {},
  desktop: { paperMargin: 32 },
};

const PAPER_BORDER = 2;

type FixedHeaderContainerProps = {
  header: ReactNode;
  children: ReactNode;
  desktopBreakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const FixedHeaderContainer = ({
  header,
  children,
  desktopBreakpoint = 'lg',
}: FixedHeaderContainerProps) => {
  const [headerHeight, setHeaderHeight] = useState<number | null>(null);
  const [paperHeightInPx, setPaperHeightInPx] = useState<number | null>(null);

  const theme = useTheme();
  const isMobileHeader = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up(desktopBreakpoint));
  const headerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const headerObserver = new ResizeObserver(() => {
      setHeaderHeight(headerRef.current?.offsetHeight || null);
    });
    const paperObserver = new ResizeObserver(() => {
      setPaperHeightInPx(paperRef.current?.offsetHeight || null);
    });

    if (headerRef.current) {
      headerObserver.observe(headerRef.current);
    }
    if (paperRef.current) {
      paperObserver.observe(paperRef.current);
    }

    return () => {
      headerObserver.disconnect();
      paperObserver.disconnect();
    };
  }, []);

  const paperHeightCSS = useMemo<string | undefined>(() => {
    const usedPx =
      globalNavbarHeight[isMobileHeader ? 'mobile' : 'desktop'] +
      sumObjectValues(heights[isDesktop ? 'desktop' : 'mobile']) +
      (headerHeight || 0);
    return `calc(100vh - ${usedPx}px)`;
  }, [isMobileHeader, isDesktop, headerHeight]);

  const childrenWithProps = useMemo(() => {
    // Provide the 'containerHeight' prop to children components,
    // allowing them to adjust their layout based on the height of the container.
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as ReactElement<any>, {
          containerHeight: paperHeightInPx ? paperHeightInPx - PAPER_BORDER : null,
        });
      }
      return child;
    });
  }, [children, paperHeightInPx]);

  return (
    <>
      <div ref={headerRef}>{header}</div>
      <Paper ref={paperRef} className={styles.paper} sx={{ height: paperHeightCSS }}>
        {childrenWithProps}
      </Paper>
    </>
  );
};

export default FixedHeaderContainer;
