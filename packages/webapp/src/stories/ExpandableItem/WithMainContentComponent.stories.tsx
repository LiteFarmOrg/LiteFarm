/*
 *  Copyright 2025 LiteFarm.org
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

import { useState } from 'react';
import Expandable from '../../components/Expandable/ExpandableItem';
import { componentDecorators } from '../Pages/config/Decorators';
import MainContent, { MainContentProps } from '../../components/Expandable/MainContent';

const ExpandableWithMainContent = (props: Omit<MainContentProps, 'isExpanded' | 'children'>) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Expandable
      itemKey="itemKey"
      isExpanded={isExpanded}
      iconClickOnly={false}
      leftCollapseIcon
      expandedContent={'Expanded content'}
      onClick={() => setIsExpanded(!isExpanded)}
      mainContent={
        <MainContent isExpanded={isExpanded} {...props}>
          Main content
        </MainContent>
      }
    />
  );
};

export default {
  title: 'Components/Expandable/WithMainContentComponent',
  component: ExpandableWithMainContent,
  decorators: componentDecorators,
};

export const DecoratedIcon = {
  args: { iconType: 'decorated' },
};

export const SimpleIcon = {
  args: { iconType: 'simple' },
};

export const Error = {
  args: { errorCount: 2 },
};

export const Removable = {
  args: { onRemove: () => console.log('Remove') },
};
