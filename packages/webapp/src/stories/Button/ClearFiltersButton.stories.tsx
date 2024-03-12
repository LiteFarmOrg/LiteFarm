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
import type { Meta, StoryObj } from '@storybook/react';
import { useTheme, useMediaQuery } from '@mui/material';
import { componentDecorators } from '../Pages/config/Decorators';
import ClearFiltersButton, {
  ClearFiltersButtonType,
  type ClearFiltersButtonProps,
} from '../../components/Button/ClearFiltersButton';
import { Main } from '../../components/Typography';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<ClearFiltersButtonProps> = {
  title: 'Components/Button/ClearFiltersButton',
  component: ClearFiltersButton,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof ClearFiltersButton>;

const commonProps = {
  onClick: () => console.log('CLICKED!'),
  isFiltered: true,
};

export const IconButton: Story = {
  args: { ...commonProps, type: ClearFiltersButtonType.ICON },
};

export const TextButton: Story = {
  args: { ...commonProps, type: ClearFiltersButtonType.TEXT },
};

export const ResponsiveButton: Story = {
  args: commonProps,
  render: (props) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
      <>
        <Main>Resize window to see Icon / Text button</Main>
        <ClearFiltersButton
          {...props}
          type={isMobile ? ClearFiltersButtonType.ICON : ClearFiltersButtonType.TEXT}
        />
      </>
    );
  },
};
