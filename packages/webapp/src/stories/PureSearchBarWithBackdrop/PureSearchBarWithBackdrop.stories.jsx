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
import PureSearchBarWithBackdrop from '../../components/PopupFilter/PureSearchWithBackdrop';
import { componentDecorators } from '../Pages/config/Decorators';
import { Main, Info } from '../../components/Typography';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/styles';

export default {
  title: 'Components/PureSearchBarWithBackdrop',
  component: PureSearchBarWithBackdrop,
  decorators: componentDecorators,
};

const SearchContainer = (props) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const zIndexBase = theme.zIndex.drawer;

  return (
    <Suspense fallback="loading">
      <div
        style={{
          outline: '1px dashed',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '16px',
        }}
      >
        <Info style={{ padding: '8px' }}>Container</Info>
        <PureSearchBarWithBackdrop isDesktop={isDesktop} zIndexBase={zIndexBase} {...props} />
      </div>
    </Suspense>
  );
};

const Template = (args) => <SearchContainer {...args} />;

export const Plain = Template.bind({});
Plain.args = {};

export const CustomPlaceholder = Template.bind({});
CustomPlaceholder.args = {
  placeholderText: 'Search transactions',
};
