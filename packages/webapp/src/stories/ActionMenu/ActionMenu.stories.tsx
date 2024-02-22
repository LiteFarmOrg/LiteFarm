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
import ActionMenu, { ActionMenuProps } from '../../components/ActionMenu';
import { ReactComponent as AddAnimalIcon } from '../../assets/images/animals/add-animal.svg';
import { ReactComponent as TaskCreationIcon } from '../../assets/images/create-task.svg';
import { ReactComponent as CloneIcon } from '../../assets/images/clone.svg';
import { ReactComponent as RemoveAnimalIcon } from '../../assets/images/animals/remove-animal.svg';
import { SideMenuContent } from '../../components/Navigation/SideMenu';
import styles from './styles.module.scss';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<ActionMenuProps> = {
  title: 'Components/ActionMenu',
  component: ActionMenu,
};
export default meta;

type Story = StoryObj<typeof ActionMenu>;

const createLabelAndOnClick = (label: string): { label: string; onClick: () => void } => {
  return {
    label,
    onClick: () => console.log(`${label} clicked!`),
  };
};

const iconActions = [
  {
    icon: <AddAnimalIcon />,
    ...createLabelAndOnClick('Add to group'),
  },
  {
    icon: <TaskCreationIcon />,
    ...createLabelAndOnClick('Create a task'),
  },
  { icon: <CloneIcon />, ...createLabelAndOnClick('Clone') },
  {
    icon: <RemoveAnimalIcon />,
    ...createLabelAndOnClick('Remove animal'),
  },
];

export const Default: Story = {
  args: {
    textActions: [
      createLabelAndOnClick('Select all 152'),
      createLabelAndOnClick('Clear Selection'),
    ],
    iconActions,
    headerLeftText: '2 Selected',
  },
};

export const WithoutHeaderText: Story = {
  args: { iconActions },
};

export const WithLongIconLabels: Story = {
  args: {
    iconActions: [
      {
        icon: <AddAnimalIcon />,
        ...createLabelAndOnClick('Add animal long label'),
      },
      {
        icon: <TaskCreationIcon />,
        ...createLabelAndOnClick('Create a task long label'),
      },
      { icon: <CloneIcon />, ...createLabelAndOnClick('Clone long label') },
      {
        icon: <RemoveAnimalIcon />,
        ...createLabelAndOnClick('Remove animal long label'),
      },
    ],
  },
};

export const CenteringWithinParent: Story = (args: ActionMenuProps) => {
  return (
    <div className={styles.wrapper}>
      <SideMenuContent
        history={{ location: { pathname: 'testing' } }}
        isCompact={false}
        closeDrawer={() => ({})}
        hasBeenExpanded={false}
      />
      <div className={styles.mainColumn}>{<ActionMenu {...args} />}</div>
    </div>
  );
};
CenteringWithinParent.args = {
  textActions: [createLabelAndOnClick('Select all 152'), createLabelAndOnClick('Clear Selection')],
  iconActions,
  headerLeftText: '2 Selected',
};
