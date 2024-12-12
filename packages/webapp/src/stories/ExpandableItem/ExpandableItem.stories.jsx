/*
 *  Copyright 2023-2024 LiteFarm.org
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

import clsx from 'clsx';
import { expect } from '@storybook/test';
import { within, userEvent, waitForElementToBeRemoved } from '@storybook/test';
import Expandable from '../../components/Expandable/ExpandableItem';
import useExpandable from '../../components/Expandable/useExpandableItem';
import TransactionItem from '../../components/Finances/Transaction/Mobile/Item';
import { componentDecorators } from '../Pages/config/Decorators';
import { Main } from '../../components/Typography';
import styles from './styles.module.scss';
import { AnimalFormHeaderItem } from '../../components/Animals/AddAnimalsForm/AnimalFormHeaderItem';

export default {
  title: 'Components/Expandable',
  component: Expandable,
  decorators: componentDecorators,
};

const mockTransactionsData = [
  {
    transaction: 'Summer Harvest',
    type: 'Crop sales',
    amount: 17551.5,
    expandedContent: 'Expanded content 1',
    icon: 'SOIL_AMENDMENT',
  },
  {
    transaction: 'Gas refill',
    type: 'Fuel',
    amount: -873.0,
    expandedContent: 'Expanded content 2',
    icon: 'SOIL_AMENDMENT',
  },
  {
    transaction: 'Pesticide and traps',
    type: 'Pest control',
    amount: -873.0,
    expandedContent: 'Expanded content 3',
    icon: 'SOIL_AMENDMENT',
  },
];

const TransactionContent = ({ transaction, type, amount, icon }) => {
  return (
    <TransactionItem
      transaction={transaction}
      type={type}
      amount={amount}
      iconKey={icon}
      currencySymbol="€"
    />
  );
};

const Test = ({
  data = [],
  mainContent: MainContent,
  defaultExpandedIds = [],
  isSingleExpandable,
  iconClickOnly,
  leftCollapseIcon,
  pillBody,
  transactionStyles = true,
}) => {
  const { expandedIds, toggleExpanded } = useExpandable({ defaultExpandedIds, isSingleExpandable });
  const classes = pillBody ? undefined : AnimalsContentClasses(transactionStyles);
  return data.map((values, index) => {
    const isExpanded = expandedIds.includes(index);
    return (
      <div
        key={index}
        className={clsx(
          transactionStyles && styles.expandableItemWrapper,
          isExpanded && styles.expanded,
        )}
      >
        <Expandable
          isExpanded={isExpanded}
          onClick={() => toggleExpanded(index)}
          mainContent={<MainContent {...values} isExpanded={isExpanded} />}
          expandedContent={<div className={styles.expandedContent}>{values.expandedContent}</div>}
          iconClickOnly={iconClickOnly}
          classes={classes}
          key={index}
          leftCollapseIcon={leftCollapseIcon}
          pillBody={pillBody}
        />
      </div>
    );
  });
};

export const SingleExpandableItem = {
  render: () => (
    <Test
      data={mockTransactionsData}
      mainContent={TransactionContent}
      isSingleExpandable={true}
      iconClickOnly={false}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const data = mockTransactionsData;

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
  render: () => (
    <Test
      data={mockTransactionsData}
      mainContent={TransactionContent}
      isSingleExpandable={false}
      iconClickOnly={false}
    />
  ),
};

export const IconClickOnlyExpandableItem = {
  render: () => (
    <Test
      data={mockTransactionsData}
      mainContent={TransactionContent}
      isSingleExpandable={true}
      iconClickOnly={true}
    />
  ),
};

export const ExpandableItemWithDefaultExpanded = {
  render: () => (
    <Test
      data={mockTransactionsData}
      mainContent={TransactionContent}
      defaultExpandedIds={[1]}
      isSingleExpandable={true}
      iconClickOnly={false}
    />
  ),
};

export const LeftCollapseIcon = {
  render: () => (
    <Test
      data={mockTransactionsData}
      mainContent={TransactionContent}
      defaultExpandedIds={[1]}
      isSingleExpandable={true}
      iconClickOnly={false}
      leftCollapseIcon={true}
    />
  ),
};

// Inner expandables
const mockAnimalDetailsData = [
  {
    formTitle: 'General detail',
    expandedContent: <div className={styles.mockForm}>General form here</div>,
  },
  {
    formTitle: 'Unique detail',
    expandedContent: <div className={styles.mockForm}>Unique detail form here</div>,
  },
  {
    formTitle: 'Origin',
    expandedContent: <div className={styles.mockForm}>Origin form here</div>,
  },
  {
    formTitle: 'Other Details',
    expandedContent: <div className={styles.mockForm}>Other details form here</div>,
  },
];

const AnimalDetailsContent = ({ formTitle }) => {
  return <Main>{formTitle}</Main>;
};

// Outer expandable (AnimalFormHeaderItem)
const mockAnimalData = {
  type: 'Cattle',
  breed: 'Aberdeen',
  sex: 'Female',
  iconKey: 'CATTLE',
  number: 7,
  totalCount: 14,
  onRemove: (e) => {
    e.stopPropagation();
    console.log('removing');
  },
  expandedContent: (
    <Test
      data={mockAnimalDetailsData}
      mainContent={AnimalDetailsContent}
      isSingleExpandable
      iconClickOnly={false}
    />
  ),
};

const AnimalsMainContent = (props) => {
  return <AnimalFormHeaderItem {...props} />;
};

const AnimalsContentClasses = (transactionStyles) => {
  return {
    mainContentWithIcon: transactionStyles ? styles.expandableItem : styles.animalsExpandableItem,
    icon: transactionStyles ? '' : styles.animalsCollapseIcon,
  };
};

export const NestedExpandable = {
  render: () => (
    <Test
      data={[mockAnimalData]}
      mainContent={AnimalsMainContent}
      defaultExpandedIds={[1]}
      isSingleExpandable={true}
      iconClickOnly={false}
      leftCollapseIcon={true}
      transactionStyles={false}
    />
  ),
};

export const PillInTitleExpandable = {
  render: () => (
    <Test
      data={[mockAnimalData]}
      mainContent={() => 'Basic Title'}
      defaultExpandedIds={[1]}
      isSingleExpandable={true}
      iconClickOnly={false}
      pillBody="Batch with 5 animals"
      leftCollapseIcon={true}
      transactionStyles={false}
    />
  ),
};

const PillBodyClasses = {
  mainContentWrapper: styles.mainContentWrapper,
  mainContentWithIcon: styles.mainContentWithIcon,
  alwaysVisibleContent: styles.alwaysVisibleContent,
};
