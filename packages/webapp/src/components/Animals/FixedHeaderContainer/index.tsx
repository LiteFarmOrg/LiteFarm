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
import clsx from 'clsx';
import { Paper } from '@mui/material';
import styles from './styles.module.scss';

const PAPER_BORDER = 2;

type FixedHeaderContainerProps = {
  header: ReactNode;
  children: ReactNode;
  classes?: {
    paper?: string;
  };
};

const FixedHeaderContainer = ({ header, children, classes = {} }: FixedHeaderContainerProps) => {
  const [paperHeightInPx, setPaperHeightInPx] = useState<number | null>(null);

  const paperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const paperObserver = new ResizeObserver(() => {
      setPaperHeightInPx(paperRef.current?.offsetHeight || null);
    });

    if (paperRef.current) {
      paperObserver.observe(paperRef.current);
    }

    return () => {
      paperObserver.disconnect();
    };
  }, []);

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
    <div className={styles.wrapper}>
      {header}
      <Paper ref={paperRef} className={clsx(styles.paper, classes.paper)}>
        {childrenWithProps}
      </Paper>
    </div>
  );
};

export default FixedHeaderContainer;
