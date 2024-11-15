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
import SideDrawer from '../../components/SideDrawer';
import styles from './styles.module.scss';
import Button from '../../components/Form/Button';

const meta: Meta<typeof SideDrawer> = {
  title: 'Components/SideDrawer',
  component: SideDrawer,
  decorators: componentDecorators,
  render: (args) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);

    return (
      <div className={styles.wrapper}>
        <div className={styles.fakeMenuBar}>
          <Button color="secondary" onClick={() => setIsDrawerOpen(true)}>
            Open SideDrawer
          </Button>
        </div>
        <SideDrawer {...args} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
          <div className={styles.content}>SideDrawer content</div>
        </SideDrawer>
      </div>
    );
  },
};
export default meta;

type Story = StoryObj<typeof SideDrawer>;

export const Default: Story = {
  args: {
    title: 'SideDrawer title',
  },
};

export const CustomClasses: Story = {
  args: {
    title: 'Custom classes',
    classes: {
      drawerBackdrop: styles.customDrawerBackdrop,
      drawerHeader: styles.customDrawerHeader,
      drawerContent: styles.customDrawerContent,
      drawerContainer: styles.customDrawerContainer,
    },
  },
};
