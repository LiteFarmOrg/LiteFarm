/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
import { within, userEvent, waitFor, screen } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import selectEvent from 'react-select-event';
import { roundToTwoDecimal, convertFn } from '../../util/convert-units/unit';
import { getUnitOptionMap } from '../../util/convert-units/getUnitOptionMap';

/** Class used for testing Unit component. */
export default class UnitTest {
  constructor(canvasElement, testId, unitType = {}) {
    this.element = canvasElement ? within(canvasElement) : screen;
    this.visibleInput = this.element.getByTestId(testId);
    this.hiddenInput = this.element.getByTestId(`${testId}-hiddeninput`);
    this.select = this.element.getByTestId(`${testId}-select`);
    this.testId = testId;
    this.unitType = unitType;
  }

  async clearInput() {
    await userEvent.clear(this.visibleInput);
  }

  async clearInputAndBlur() {
    await this.clearInput();
    await userEvent.click(document.body);
  }

  async clearError() {
    const clearButton = await this.element.findByTestId(`${this.testId}-errorclearbutton`);
    await userEvent.click(clearButton);
  }

  async inputValue(value) {
    await this.clearInput();
    await userEvent.type(this.visibleInput, value);
  }

  async inputValueAndBlur(value) {
    await this.inputValue(value);
    await userEvent.click(document.body);
  }

  async selectUnit(unit) {
    await selectEvent.openMenu(within(this.select).getByRole('combobox'));
    await selectEvent.select(within(this.select).getByRole('combobox'), unit);
  }

  async selectedUnitToBeInTheDocument(selectedUnit) {
    const unit = await within(this.select).findByText(selectedUnit);
    expect(unit).toBeInTheDocument();
  }

  async visibleInputToHaveValue(value) {
    await waitFor(() => {
      expect(this.visibleInput).toHaveValue(value);
    });
  }

  /**
   * Test hidden value.
   * @param {number} value - Hidden value to test or visible value to convert.
   * @param {string} [selectedUnit] - Selected unit. Should not be passed with hidden value.
   * @param {string} [databaseUnit] - Database unit. Should not be passed with hidden value.
   * @return void
   */
  async hiddenInputToHaveValue(value, selectedUnit, databaseUnit) {
    let hiddenValue = value;
    if (value && selectedUnit && databaseUnit) {
      hiddenValue = convertFn(this.unitType, value, selectedUnit, databaseUnit);
    }
    await waitFor(() => expect(this.hiddenInput).toHaveValue(hiddenValue));
  }

  async inputNotToHaveValue() {
    await waitFor(() => {
      expect(this.visibleInput).toHaveValue(null);
      expect(this.hiddenInput).toHaveValue(null);
    });
  }

  async visibleInputAndComboboxIsEnabled() {
    await waitFor(() => {
      expect(this.visibleInput).toBeEnabled();
      expect(within(this.select).getByRole('combobox')).toBeEnabled();
    });
  }

  async visibleInputAndComboxIsDisabled() {
    await waitFor(() => {
      expect(this.visibleInput).toBeDisabled();
      expect(within(this.select).getByRole('combobox')).toBeDisabled();
    });
  }

  async haveRequiredError() {
    const errorContainer = await this.element.findByTestId(`${this.testId}-errormessage`);
    expect(errorContainer).toHaveTextContent('Required');
  }

  async haveMaxValueError() {
    const errorContainer = await this.element.findByTestId(`${this.testId}-errormessage`);
    expect(errorContainer).toHaveTextContent(/Please enter a value between 0-[0-9]./);
  }

  async haveNoError() {
    await waitFor(() => {
      const clearButton = this.element.queryByTestId(`${this.testId}-errorclearbutton`);
      const requiredErrorElement = this.element.queryByText('Required');
      const maxValueErrorElement = this.element.queryByText(
        /Please enter a value between 0-[0-9]./,
      );
      expect(clearButton).not.toBeInTheDocument();
      expect(requiredErrorElement).not.toBeInTheDocument();
      expect(maxValueErrorElement).not.toBeInTheDocument();
    });
  }

  /**
   * Convert a value in the DB to a display value.
   * @param {number} value - Value retrieved from the DB (hidden value).
   * @param {string} displayUnit - Selected unit.
   * @return {number} A display value.
   */
  convertDBValueToDisplayValue(value, displayUnit) {
    return roundToTwoDecimal(
      convertFn(this.unitType, value, this.unitType.databaseUnit, displayUnit),
    );
  }

  /**
   * Convert a display value to a hidden value.
   * @param {number} value - Display value.
   * @param {string} displayUnit - Selected unit.
   * @return {number} A hidden value.
   */
  convertDisplayValueToHiddenValue(value, displayUnit) {
    return convertFn(this.unitType, value, displayUnit, this.unitType.databaseUnit);
  }

  static getUnitLabelByValue(value) {
    return getUnitOptionMap()[value].label;
  }
}

export const getSystemUnmatchTestArgsAndPlay = (system, unitType, valueInDB, expectedUnit) => {
  const { databaseUnit } = unitType;
  const recordSystem = system === 'imperial' ? 'metric' : 'imperial';
  const recordUnit = unitType[recordSystem].units[0]; // the first unit of the other system
  return {
    args: {
      label: `Record unit: "${recordUnit}", DB data: "${valueInDB} ${databaseUnit}"`,
      name: 'value_name',
      displayUnitName: 'unit_name',
      unitType,
      system,
      required: true,
      defaultValues: {
        value_name: valueInDB,
        unit_name: recordUnit,
      },
    },
    play: async ({ canvasElement }) => {
      const test = new UnitTest(canvasElement, 'unit', unitType);

      await test.visibleInputToHaveValue(
        test.convertDBValueToDisplayValue(valueInDB, expectedUnit),
      );
      await test.hiddenInputToHaveValue(valueInDB);
      await test.selectedUnitToBeInTheDocument(UnitTest.getUnitLabelByValue(expectedUnit));
    },
  };
};
