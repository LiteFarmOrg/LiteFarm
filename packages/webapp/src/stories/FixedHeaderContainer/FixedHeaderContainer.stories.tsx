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

import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import FixedHeaderContainer, { ContainerKind } from '../../components/Animals/FixedHeaderContainer';
import PureSideMenu from '../../components/Navigation/SideMenu';
import TopMenu from '../../components/Navigation/TopMenu/TopMenu';

const ComponentWithNav = ({ kind }: { kind: ContainerKind }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ display: 'flex' }}>
      <PureSideMenu history={{ location: { pathname: '' } }} isMobile={false} />
      <div style={{ width: '100%' }}>
        <TopMenu
          history={{ location: { pathname: '' } }}
          isMobile={undefined}
          showNavActions={undefined}
          onClickBurger={undefined}
          showNav={true}
          isFeedbackSurveyOpen={isOpen}
          setFeedbackSurveyOpen={setIsOpen}
        />
        <FixedHeaderContainer
          kind={kind}
          header={<div style={{ backgroundColor: '#16423d', height: '70px' }}>HEADER</div>}
        >
          <div>
            <div style={{ height: '60vh', backgroundColor: '#A2D2CD' }}>CONTENT 1</div>
            <div style={{ height: '60vh', backgroundColor: '#3ea992' }}>CONTENT 2</div>
          </div>
        </FixedHeaderContainer>
      </div>
    </div>
  );
};

const meta: Meta<typeof FixedHeaderContainer> = {
  title: 'Components/FixedHeaderContainer',
  component: FixedHeaderContainer,
};

export default meta;

type Story = StoryObj<typeof FixedHeaderContainer>;

export const Overflow: Story = {
  render: () => {
    return <ComponentWithNav kind={ContainerKind.OVERFLOW} />;
  },
};

export const Paper: Story = {
  render: () => {
    return <ComponentWithNav kind={ContainerKind.PAPER} />;
  },
};
