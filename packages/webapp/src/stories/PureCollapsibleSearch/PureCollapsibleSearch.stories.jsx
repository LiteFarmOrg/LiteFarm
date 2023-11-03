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

import { Suspense, useRef } from 'react';
import PureCollapsibleSearch from '../../components/PopupFilter/PureCollapsibleSearch';
import { componentDecorators } from '../Pages/config/Decorators';
import { Main, Info } from '../../components/Typography';

export default {
  title: 'Components/CollapsibleSearch',
  component: PureCollapsibleSearch,
  decorators: componentDecorators,
};

const CollapsibleSearchContainer = (props) => {
  const containerRef = useRef(null);

  return (
    <Suspense fallback="loading">
      <Main style={{ paddingBlock: '16px' }}>Adjust window width to collapse/expand</Main>
      <div
        ref={containerRef}
        style={{
          outline: '1px dashed',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '16px',
        }}
      >
        <Info style={{ padding: '8px' }}>Container</Info>
        <PureCollapsibleSearch
          containerRef={props.useContainerRef ? containerRef : null}
          {...props}
        />
      </div>
    </Suspense>
  );
};

const Template = (args) => <CollapsibleSearchContainer {...args} />;

export const Inactive = Template.bind({});
Inactive.args = {};

export const Active = Template.bind({});
Active.args = {
  isSearchActive: true,
};

export const CustomPlaceholder = Template.bind({});
CustomPlaceholder.args = {
  placeholderText: 'Search transactions',
};

/* Width tracks resize of container ref */
export const OverlayModalOnContainer = Template.bind({});
OverlayModalOnContainer.args = {
  useContainerRef: true,
};
