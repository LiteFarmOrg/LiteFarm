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
import React from 'react';
import clsx from 'clsx';
import { expect } from '@storybook/jest';
import { within, userEvent, waitForElementToBeRemoved } from '@storybook/testing-library';
import Expandable from '../../components/Expandable/ExpandableItem';
import useExpandable from '../../components/Expandable/useExpandableItem';
import { componentDecorators } from '../Pages/config/Decorators';
import { ReactComponent as SoilAmendment } from '../../assets/images/task/SoilAmendment.svg';
import styles from './styles.module.scss';

export default {
  title: 'Components/Expandable',
  component: Expandable,
  decorators: componentDecorators,
};

const data = [
  {
    transaction: 'Summer Harvest',
    type: 'Crop sales',
    amount: '+ €17551.50',
    expandedContent: 'Expanded content 1',
    icon: <SoilAmendment />,
  },
  {
    transaction: 'Gas refill',
    type: 'Fuel',
    amount: '- €873.00',
    expandedContent: 'Expanded content 2',
    icon: <SoilAmendment />,
  },
  {
    transaction: 'Pesticide and traps',
    type: 'Pest control',
    amount: '- €873.00',
    expandedContent: 'Expanded content 3',
    icon: <SoilAmendment />,
  },
];

const MainContent = ({ transaction, type, amount, icon }) => {
  return (
    <div className={styles.mainContent}>
      <div className={styles.mainContentLeft}>
        <div>{icon}</div>
        <div>
          <div className={styles.mainContentTitle}>{transaction}</div>
          <div className={styles.mainContentInfo}>{type}</div>
        </div>
      </div>
      <div>{amount}</div>
    </div>
  );
};

const Test = ({ defaultExpandedIds = [], isSingleExpandable, iconClickOnly }) => {
  const { expandedIds, toggleExpanded } = useExpandable({ defaultExpandedIds, isSingleExpandable });

  return data.map((values, index) => {
    const isExpanded = expandedIds.includes(index);
    return (
      <div key={index} className={clsx(styles.item, isExpanded && styles.expanded)}>
        <Expandable
          isExpanded={isExpanded}
          onClick={() => toggleExpanded(index)}
          mainContent={<MainContent {...values} />}
          expandedContent={<div className={styles.expandedContent}>{values.expandedContent}</div>}
          iconClickOnly={iconClickOnly}
          classes={{ mainContentWithIcon: styles.mainContentWithIcon, icon: styles.icon }}
        />
      </div>
    );
  });
};

export const SingleExpandableItem = {
  render: () => <Test isSingleExpandable={true} iconClickOnly={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const row0 = canvas.getByText(data[0].transaction);
    await userEvent.click(row0);
    const expandedContent0 = await canvas.findByText(data[0].expandedContent);
    expect(expandedContent0).toBeInTheDocument();

    await userEvent.click(row0);
    await waitForElementToBeRemoved(() => canvas.queryByText(data[0].expandedContent));
    expect(expandedContent0).not.toBeInTheDocument();

    const row1 = canvas.getByText(data[1].transaction);
    await userEvent.click(row1);
    const expandedContent1 = await canvas.findByText(data[1].expandedContent);
    expect(expandedContent1).toBeInTheDocument();
    expect(expandedContent0).not.toBeInTheDocument();
    let expandedContent2 = await canvas.queryByText(data[2].expandedContent);
    expect(expandedContent2).not.toBeInTheDocument();

    const row2 = canvas.getByText(data[2].transaction);
    await userEvent.click(row2);
    expandedContent2 = await canvas.findByText(data[2].expandedContent);
    expect(expandedContent2).toBeInTheDocument();

    await waitForElementToBeRemoved(() => canvas.queryByText(data[1].expandedContent));
    expect(expandedContent1).not.toBeInTheDocument();
    expect(expandedContent0).not.toBeInTheDocument();
  },
};

export const MultipleExpandableItem = {
  render: () => <Test isSingleExpandable={false} iconClickOnly={false} />,
};

export const IconClickOnlyExpandableItem = {
  render: () => <Test isSingleExpandable={true} iconClickOnly={true} />,
};

export const ExpandableItemWithDefaultExpanded = {
  render: () => <Test defaultExpandedIds={[1]} isSingleExpandable={true} iconClickOnly={false} />,
};
