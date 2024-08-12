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
import { Suspense } from 'react';
import { within, userEvent, screen, fireEvent } from '@storybook/test';
import { expect } from '@storybook/test';
import selectEvent from 'react-select-event';
import moment from 'moment';
import DateRangeSelector from '../../components/DateRangeSelector';
import { componentDecorators } from '../Pages/config/Decorators';
import { dateRangeOptions } from '../../components/DateRangeSelector/constants';
import { FROM_DATE, TO_DATE } from '../../components/Form/DateRangePicker';

export default {
  title: 'Components/DateRangeSelector',
  component: DateRangeSelector,
  decorators: componentDecorators,
};

const TestComponent = (props) => {
  return (
    <Suspense fallback={'Loading...'}>
      <DateRangeSelector
        changeDateMethod={() => ({})}
        onChangeDateRangeOption={() => ({})}
        {...props}
      />
    </Suspense>
  );
};

export const WithPlaceholder = {
  render: () => {
    return <TestComponent placeholder="Select Date Range" />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const select = await canvas.findByRole('combobox');
    await selectEvent.openMenu(select);

    let option = await screen.findByText('Pick a custom range');
    await fireEvent.click(option);

    const [input1] = await canvas.findAllByTestId('input');
    await fireEvent.click(option);

    await userEvent.type(input1, '2023-11-01');
    await selectEvent.openMenu(select);

    const selectedOptionText = await canvas.findByText('Year to date');
    expect(selectedOptionText).toBeInTheDocument();
  },
};

export const WithDefaultOption = {
  render: () => {
    return <TestComponent defaultDateRangeOptionValue={dateRangeOptions.YEAR_TO_DATE} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    let selectedOptionText = await canvas.findByText('Year to date');
    expect(selectedOptionText).toBeInTheDocument();

    const select = canvas.getByRole('combobox');
    await selectEvent.openMenu(select);

    let option = screen.getByText('Last 7 days');
    await userEvent.click(option);

    await selectEvent.openMenu(select);
    option = screen.getAllByText('Last 7 days')[1];
    expect(option).toHaveStyle('font-weight: 700');

    option = screen.getByText('Pick a custom range');
    await userEvent.click(option);

    const backButton = await canvas.findByText('back');
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveStyle('color: #d4dae3');

    await userEvent.click(backButton);
    expect(backButton).toBeInTheDocument();

    selectedOptionText = canvas.getByText('yyyy.mm.dd - yyyy.mm.dd');
    expect(selectedOptionText).toBeInTheDocument();

    const [input1, input2] = canvas.getAllByTestId('input');
    await userEvent.clear(input1);
    await userEvent.clear(input2);

    await userEvent.type(input1, '2023-11-01');
    expect(selectedOptionText).toBeInTheDocument();

    await userEvent.type(input2, '2022-11-01');
    expect(selectedOptionText).toBeInTheDocument();

    const errorMessage = await canvas.findByText(
      `End date must be after start date to return results`,
    );
    expect(errorMessage).toBeInTheDocument();
  },
};

export const WithDefaultCustomDateRange = {
  render: () => {
    return (
      <TestComponent
        defaultDateRangeOptionValue={dateRangeOptions.CUSTOM}
        defaultCustomDateRange={{
          [FROM_DATE]: moment('2023-01-01'),
          [TO_DATE]: moment('2024-01-01'),
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    let selectedOptionText = await canvas.findByText('2023-01-01 - 2024-01-01');
    expect(selectedOptionText).toBeInTheDocument();

    const select = canvas.getByRole('combobox');
    await selectEvent.openMenu(select);

    let option = screen.getByText('Pick a custom range');
    await fireEvent.click(option);

    const [input1, input2] = await canvas.findAllByTestId('input');
    await userEvent.clear(input1);
    await userEvent.clear(input2);

    selectedOptionText = canvas.getByText('yyyy.mm.dd - yyyy.mm.dd');

    await userEvent.type(input1, '2021-01-01');
    expect(selectedOptionText).toBeInTheDocument();

    await userEvent.type(input2, '2023-12-31');

    selectedOptionText = await canvas.findByText('2021-01-01 - 2023-12-31');
    expect(selectedOptionText).toBeInTheDocument();

    const clearButton = canvas.getByText('Clear dates');
    await userEvent.click(clearButton);

    const errorMessage = canvas.queryByText(`End date must be after start date to return results`);
    expect(errorMessage).not.toBeInTheDocument();

    await userEvent.clear(input1);
    await userEvent.clear(input2);
    await userEvent.type(input1, '2023-01-01');
    await userEvent.type(input2, '2024-01-01');

    selectedOptionText = await canvas.findByText('2023-01-01 - 2024-01-01');
    expect(selectedOptionText).toBeInTheDocument();

    const backButton = await canvas.findByText('back');
    expect(backButton).toBeInTheDocument();

    await userEvent.click(backButton);
    option = await screen.findByText('Pick a custom range');
    expect(option).toHaveStyle('font-weight: 700');

    await userEvent.click(document.body);
    expect(selectedOptionText).toBeInTheDocument();
  },
};
