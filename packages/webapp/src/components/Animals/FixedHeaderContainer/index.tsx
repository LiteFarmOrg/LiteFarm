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

import React, {
  ReactElement,
  ReactNode,
  RefObject,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { matchPath, useLocation } from 'react-router';
import clsx from 'clsx';
import { Paper } from '@mui/material';
import { ADD_ANIMALS_URL } from '../../../util/siteMapConstants';
import styles from './styles.module.scss';

const PAPER_BORDER = 2;

const CONTENT_FULL_WIDTH_ROUTES = [ADD_ANIMALS_URL];

export enum ContainerKind {
  OVERFLOW,
  PAPER,
}

type FixedHeaderContainerProps = {
  kind?: ContainerKind;
  header: ReactNode;
  children: ReactNode;
  classes?: {
    paper?: string;
    divWrapper?: string;
    wrapper?: string;
  };
};

type WrapperProps = Pick<FixedHeaderContainerProps, 'children' | 'classes'> & {
  hasMaxWidth: boolean;
};
type PaperWrapperProps = WrapperProps & { paperRef: RefObject<HTMLDivElement> | null };

const PaperWrapper = ({ children, paperRef, classes = {}, hasMaxWidth }: PaperWrapperProps) => (
  <Paper
    component="div"
    ref={paperRef}
    className={clsx(styles.paper, hasMaxWidth && styles.hasMaxWidth, classes.paper)}
  >
    {children}
  </Paper>
);

const DivWrapper = ({ children, classes = {}, hasMaxWidth }: WrapperProps) => (
  <div className={clsx(styles.overflowStyle, classes.divWrapper)}>
    <div className={clsx(styles.childrenWrapper, hasMaxWidth && styles.hasMaxWidth)}>
      {children}
    </div>
  </div>
);

const FixedHeaderContainer = ({
  header,
  children,
  classes = {},
  kind = ContainerKind.OVERFLOW,
}: FixedHeaderContainerProps) => {
  let location = useLocation();
  const [paperHeightInPx, setPaperHeightInPx] = useState<number | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const isFullWidth = CONTENT_FULL_WIDTH_ROUTES.some((path) => matchPath(location.pathname, path));

  useLayoutEffect(() => {
    if (kind === ContainerKind.OVERFLOW) {
      return;
    }

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
    if (kind === ContainerKind.OVERFLOW) {
      return children;
    }

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

  const Wrapper = kind === ContainerKind.OVERFLOW ? DivWrapper : PaperWrapper;

  return (
    <div className={clsx(styles.wrapper, classes.wrapper)}>
      {header}
      <Wrapper paperRef={paperRef} classes={classes} hasMaxWidth={!isFullWidth}>
        {childrenWithProps}
      </Wrapper>
    </div>
  );
};

export default FixedHeaderContainer;
