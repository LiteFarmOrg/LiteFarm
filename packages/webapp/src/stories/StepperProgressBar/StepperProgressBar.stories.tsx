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
import StepperProgressBar from '../../components/StepperProgressBar';
import { Main } from '../../components/Typography';

const meta: Meta<typeof StepperProgressBar> = {
  title: 'Components/StepperProgressBar',
  component: StepperProgressBar,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof StepperProgressBar>;

export const Default: Story = {
  args: {
    steps: ['Animal basics', 'Animal details', 'Done'],
  },
};

export const Mobile: Story = {
  args: {
    steps: ['Animal basics', 'Animal details', 'Done'],
    isMobile: true,
  },
};

export const Dark: Story = {
  args: {
    steps: ['Animal basics', 'Animal details', 'Done'],
    activeStep: 1,
    isDarkMode: true,
  },
};

export const FourSteps: Story = {
  args: {
    steps: ['Task type', 'Task basics', 'Task details', 'Done'],
    activeStep: 2,
  },
};

export const Responsive: Story = {
  args: {
    steps: ['Animal basics', 'Animal details', 'Done'],
    activeStep: 1,
    isDarkMode: true,
  },
  render: (props) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
      <>
        <Main style={{ paddingBottom: '16px' }}>
          Resize window to switch between mobile and desktop view
        </Main>
        <StepperProgressBar
          steps={props.steps}
          activeStep={props.activeStep}
          isMobile={isMobile}
          isDarkMode={props.isDarkMode}
        />
      </>
    );
  },
};
