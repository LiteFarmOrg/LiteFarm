/*
 *  Copyright 2026 LiteFarm.org
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

import { Meta, StoryObj } from '@storybook/react/*';
import { componentDecorators } from '../Pages/config/Decorators';
import ModalComponent, { ModalComponentProps } from '../../components/Modals/ModalComponent/v3';
import { Label } from '../../components/Typography';
import Button from '../../components/Form/Button';
import { ReactComponent as Email } from '../../assets/images/export/email/Email.svg';

export default {
  title: 'Components/Modals/ModalComponentV3',
  decorators: componentDecorators,
  component: ModalComponent,
} as Meta<typeof ModalComponent>;

type Story = StoryObj<ModalComponentProps>;

export const Default: Story = {
  args: {
    title: 'Modal Title',
    children: 'This is the Modal text',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Link sent',
    children: 'A link has been sent. Please check your email.',
    icon: <Email />,
  },
};

export const OneButton: Story = {
  args: {
    title: 'Link sent',
    children: <Label>A link has been sent. Please check your email.</Label>,
    buttonGroup: <Button sm>Click</Button>,
  },
};

export const TwoButtons: Story = {
  args: {
    title: 'Are you sure you want to logout?',
    children: 'You won’t be able to log back in while offline.',
    buttonGroup: (
      <>
        <Button color="secondary-cta" sm>
          Cancel
        </Button>
        <Button sm>Log out</Button>
      </>
    ),
  },
};

export const WithTooltip: Story = {
  args: {
    title: 'Modal Title',
    children: 'This is the Modal text',
    tooltipContent: 'This is the tooltip content.',
  },
};

export const Warning: Story = {
  args: {
    title: 'Cancel your management plan?',
    titleType: 'warning' as ModalComponentProps['titleType'],
    buttonGroup: (
      <>
        <Button color="secondary" sm>
          No
        </Button>
        <Button sm>Yes</Button>
      </>
    ),
    children: 'Any information you’ve entered will be discarded. Do you want to proceed?',
  },
};

export const Error: Story = {
  args: {
    title: 'Unable to retire',
    children:
      'All crops and tasks associated with Field 1 need to be expired in order to retire the location.',
    titleType: 'error' as ModalComponentProps['titleType'],
  },
};
