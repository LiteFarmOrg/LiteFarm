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

import React from 'react';
import Plain from './CellTypes/Plain';
import HoverPillOverflow from './CellTypes/HoverPillOverflow';
import RightChevronLink from './CellTypes/RightChevronLink';
import IconText from './CellTypes/IconText';
import {
  CellType,
  KindComponentKVP,
  PlainCellProps,
  RightChevronLinkProps,
  IconTextProps,
} from '../types';
import { HoverPillProps } from '../../HoverPill';

const CellComponents: KindComponentKVP = {
  [CellType.PLAIN]: (props: PlainCellProps) => <Plain {...props} />,
  [CellType.HOVER_PILL_OVERFLOW]: (props: HoverPillProps) => <HoverPillOverflow {...props} />,
  [CellType.RIGHT_CHEVRON_LINK]: (props: RightChevronLinkProps) => <RightChevronLink {...props} />,
  [CellType.ICON_TEXT]: (props: IconTextProps) => <IconText {...props} />,
};

/**
 * A component that selects between available Cell styles.
 * See packages/webapp/src/stories/Table/Cell.stories.jsx for examples.
 */
// TODO: export default function Cell({ kind, ...props } : {kind:CellType, props: any | HoverPillProps | OtherProps}) {
export default function Cell({ kind, ...props }: any) {
  return kind ? CellComponents[kind](props) : CellComponents[CellType.PLAIN](props);
}
