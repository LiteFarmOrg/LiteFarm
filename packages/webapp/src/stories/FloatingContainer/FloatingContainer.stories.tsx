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
import { componentDecorators } from '../Pages/config/Decorators';
import FloatingContainer from '../../components/FloatingContainer';
import { Main } from '../../components/Typography';
import styles from './styles.module.scss';

const meta: Meta<typeof FloatingContainer> = {
  title: 'Components/FloatingContainer',
  component: FloatingContainer,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof FloatingContainer>;

export const Default: Story = {
  args: {
    distanceFromBottom: '32px',
  },
  render: (props) => {
    return (
      <div className={styles.wrapper}>
        <Main style={{ paddingBottom: '16px' }}>
          Resize window to switch between mobile and desktop view
        </Main>
        <FloatingContainer
          isCompactSideMenu={true}
          distanceFromBottom={props.distanceFromBottom || '16px'}
        >
          <div className={styles.floatingContent}>Floating content</div>
        </FloatingContainer>
      </div>
    );
  },
};
