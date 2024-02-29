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
import Plain from './CellTypes/Plain';
import HoverPillOverflow from './CellTypes/HoverPillOverflow';
import RightChevronLink from './CellTypes/RightChevronLink';
import IconText from './CellTypes/IconText';
import { CellKind } from '../types';
import type { HoverPillOverflowProps } from './CellTypes/HoverPillOverflow';
import type { IconTextProps } from './CellTypes/IconText';
import type { PlainCellProps } from './CellTypes/Plain';
import type { RightChevronLinkProps } from './CellTypes/RightChevronLink';

type HoverPillOverflowPropsStrategy = HoverPillOverflowProps & {
  kind: CellKind.HOVER_PILL_OVERFLOW;
};
type IconTextPropsStrategy = IconTextProps & { kind: CellKind.ICON_TEXT };
type PlainCellPropsStrategy = PlainCellProps & { kind: CellKind.PLAIN };
type RightChevronLinkPropsStrategy = RightChevronLinkProps & { kind: CellKind.RIGHT_CHEVRON_LINK };

type CellStrategyProps =
  | HoverPillOverflowPropsStrategy
  | IconTextPropsStrategy
  | PlainCellPropsStrategy
  | RightChevronLinkPropsStrategy;

/**
 * A component that selects between available Cell styles.
 * See packages/webapp/src/stories/Table/Cell.stories.jsx for examples.
 */
const Cell = ({ kind, ...props }: CellStrategyProps) => {
  switch (kind) {
    case CellKind.HOVER_PILL_OVERFLOW:
      return <HoverPillOverflow {...(props as HoverPillOverflowProps)} />;
    case CellKind.ICON_TEXT:
      return <IconText {...(props as IconTextProps)} />;
    case CellKind.PLAIN:
      return <Plain {...(props as PlainCellProps)} />;
    case CellKind.RIGHT_CHEVRON_LINK:
      return <RightChevronLink {...(props as RightChevronLinkProps)} />;
    default:
      const _exhaustiveCheck: never = kind;
      return null;
  }
};

export default Cell;
