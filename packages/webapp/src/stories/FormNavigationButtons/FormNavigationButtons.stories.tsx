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

import { ReactNode } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import FormNavigationButtons from '../../components/Form/FormNavigationButtons';
import { componentDecorators } from '../Pages/config/Decorators';
import { Main } from '../../components/Typography';
import styles from './styles.module.scss';
import FloatingContainer from '../../components/FloatingContainer';

const meta: Meta<typeof FormNavigationButtons> = {
  title: 'Components/FormNavigationButtons',
  component: FormNavigationButtons,
  decorators: [
    (Story) => (
      <ResizeWrapper>
        <Story />
      </ResizeWrapper>
    ),
    ...componentDecorators,
  ],
};

export default meta;

interface ResizeWrapperProps {
  children: ReactNode;
}

const ResizeWrapper = ({ children }: ResizeWrapperProps) => {
  return (
    <div className={styles.wrapper}>
      <Main className={styles.note}>Resize window to see mobile / desktop buttons</Main>
      {children}
    </div>
  );
};

type Story = StoryObj<typeof FormNavigationButtons>;

const onClickHandlers = {
  onCancel: () => {
    console.log('cancel has been clicked!');
  },
  onContinue: () => {
    console.log('continue has been clicked!');
  },
};

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
};

export const FinalStep: Story = {
  args: {
    isFinalStep: true,
    ...onClickHandlers,
  },
};

export const WithPreviousButton: Story = {
  args: {
    onPrevious: () => console.log('It uses onPrevious prop.'),
  },
};

export const WithInformationalText: Story = {
  args: {
    isFinalStep: true,
    informationalText: 'You can save and fill in details later',
    ...onClickHandlers,
  },
};

export const WithContextualText: Story = {
  args: {
    isFinalStep: true,
    contextualContent: 'Adding new health record',
    ...onClickHandlers,
  },
};

export const WithContexualElement: Story = {
  args: {
    isFinalStep: true,
    /* Ultimately a <Trans> component from i18next-react would be used for this kind of styled + translated text */
    contextualContent: (
      <span>
        Animal selected: <b>1</b> | Batch selected: <b>0</b>
      </span>
    ),
    ...onClickHandlers,
  },
};

export const InFloatingContainer: Story = {
  args: {
    isFinalStep: true,
    informationalText: 'You can save and fill in details later',
    ...onClickHandlers,
  },
  render: (props) => {
    return (
      <div className={styles.floatingWrapper}>
        <FloatingContainer isCompactSideMenu={true}>
          <FormNavigationButtons {...props} />
        </FloatingContainer>
      </div>
    );
  },
};
