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

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../Pages/config/Decorators';
import Drawer from '../../components/Drawer';
import { Main } from '../../components/Typography';
import styles from './styles.module.scss';
import Button from '../../components/Form/Button';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  decorators: componentDecorators,
  render: (args) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);

    return (
      <div className={styles.wrapper}>
        <Main style={{ paddingBottom: '16px' }}>
          Resize window to switch between mobile and desktop versions
        </Main>
        <Button color="secondary-cta" onClick={() => setIsDrawerOpen(true)}>
          Open Drawer
        </Button>
        <Drawer {...args} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
          <div className={styles.floatingContent}>Drawer content</div>
        </Drawer>
      </div>
    );
  },
};
export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  args: {
    title: 'Drawer title',
  },
};

export const FullHeight: Story = {
  args: {
    title: 'Full height drawer (mobile only)',
    fullHeight: true,
  },
};

export const NoModal: Story = {
  args: {
    title: 'No modal on desktop (responsiveModal = false)',
    responsiveModal: false,
  },
};

export const CustomClasses: Story = {
  args: {
    title: 'Custom classes',
    classes: {
      modal: styles.customModal,
      drawerBackdrop: styles.customDrawerBackdrop,
      drawerHeader: styles.customDrawerHeader,
      drawerContent: styles.customDrawerContent,
      drawerContainer: styles.customDrawerContainer,
    },
  },
};
