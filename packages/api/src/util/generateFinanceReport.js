/*
 *  Copyright (c) 2023 LiteFarm.org
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

import ExcelJS from 'exceljs';

/**
 * Generates an Excel workbook with a transaction list worksheet.
 *
 * @param {Object[]} transactions - Array of transaction objects.
 * @param {Object} reportHeaders - Headers for the report, mapping keys to column titles
 * @param {string} currencySymbol - Currency symbol for formatting amounts
 * @param {string} language - Language code for date formatting
 * @param {string} title - Title of the worksheet
 * @returns {ExcelJS.Workbook} - The generated Excel workbook
 */

export const generateTransactionsList = ({
  transactions,
  reportHeaders,
  currencySymbol,
  language,
  title,
}) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  addHeadersToWorksheet(worksheet, reportHeaders);
  setWorksheetColumnWidths(worksheet, [36, 18, 12, 14]);

  transactions.forEach((transaction) => {
    addTransactionRow({ worksheet, transaction, reportHeaders, language });
  });

  formatCurrencyColumn(worksheet, currencySymbol);

  return workbook;
};

/**
 * Adds a configuration worksheet to the provided workbook.
 *
 * @param {ExcelJS.Workbook} workbook - The Excel workbook to add the worksheet to.
 * @param {Object} configSheetHeaders - Headers for the configuration sheet.
 * @param {Object} config - Configuration settings for the worksheet.
 * @param {string} farm_name - Name of the farm.
 * @param {string} language - Language code for date formatting
 * @param {string} title - Title of the worksheet
 * @returns {ExcelJS.Workbook} - The workbook with the added configuration worksheet.
 */
export const addConfigurationWorksheet = ({
  workbook,
  configSheetHeaders,
  config,
  farm_name,
  language,
  title,
}) => {
  const worksheet = workbook.addWorksheet(title);

  addHeadersToWorksheet(worksheet, configSheetHeaders);
  setWorksheetColumnWidths(worksheet, [24, 24, 18, 18]);

  const expenseTypes = config.typesFilter.EXPENSE_TYPE
    ? Object.values(config.typesFilter.EXPENSE_TYPE)
        .filter(({ active }) => active)
        .map(({ label }) => label)
    : [];

  const revenueTypes = config.typesFilter.REVENUE_TYPE
    ? Object.values(config.typesFilter.REVENUE_TYPE)
        .filter(({ active }) => active)
        .map(({ label }) => label)
    : [];

  const dateRange = `${formatDate(config.dateFilter.startDate, language)} - ${formatDate(
    config.dateFilter.endDate,
    language,
  )}`;

  addConfigDataRows({
    worksheet,
    farm_name,
    dateRange,
    expenseTypes,
    revenueTypes,
  });

  // Wrap just the farm name field
  const farmColumn = worksheet.getColumn(1);
  farmColumn.eachCell((cell) => {
    cell.alignment = { wrapText: true };
  });

  return workbook;
};

/**
 * Adds header row to the worksheet and formats it
 *
 * @param {ExcelJS.Worksheet} worksheet - The worksheet to add headers to.
 * @param {Object} reportHeaders - Object with header keys and labels.
 */
function addHeadersToWorksheet(worksheet, reportHeaders) {
  const headers = Object.values(reportHeaders);
  const headerRow = worksheet.addRow(headers);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
  });
}

/**
 * Sets the width of columns in the worksheet.
 *
 * @param {ExcelJS.Worksheet} worksheet - The worksheet to set column widths on.
 * @param {number[]} columnWidths - Array of widths for each column.
 */
function setWorksheetColumnWidths(worksheet, columnWidths) {
  worksheet.columns.forEach((column, index) => {
    column.width = columnWidths[index] || 10;
  });
}

/**
 * Adds a transaction row to the worksheet.
 *
 * @param {ExcelJS.Worksheet} worksheet - The worksheet to add the row to.
 * @param {Object} transaction - The transaction object to add.
 * @param {Object} reportHeaders - Headers used for determining the order of data in rows.
 * @param {string} language - Language code for date formatting.
 */
function addTransactionRow({ worksheet, transaction, reportHeaders, language }) {
  const rowValues = Object.keys(reportHeaders).map((key) => {
    if (key === 'date' && transaction[key]) {
      return formatDate(transaction[key], language);
    }
    return transaction[key] || '';
  });
  worksheet.addRow(rowValues);
}

/**
 * Formats the currency column (amount) in the transaction list.
 *
 * @param {ExcelJS.Worksheet} worksheet - The worksheet containing the currency column.
 * @param {string} currencySymbol - The currency symbol to use in formatting.
 */
function formatCurrencyColumn(worksheet, currencySymbol) {
  const currencyColumn = worksheet.getColumn(4);
  currencyColumn.numFmt = `"${currencySymbol}"#,##0.00;-"${currencySymbol}"#,##0.00`;

  // Style with the same colours as transaction list
  currencyColumn.eachCell((cell) => {
    const value = parseFloat(cell.value);
    if (!isNaN(value)) {
      if (value < 0) {
        cell.font = { color: { argb: 'D02620' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8E8' },
        };
      } else {
        cell.font = { color: { argb: '048211' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'E3F8EC' },
        };
      }
    }
  });
}

/**
 * Adds configuration data rows to the worksheet.
 *
 * @param {ExcelJS.Worksheet} worksheet - The configuration worksheet.
 * @param {string} farm_name - The farm name.
 * @param {string} dateRange - The formatted date range.
 * @param {string[]} expenseTypes - Array of expense type labels.
 * @param {string[]} revenueTypes - Array of revenue type labels.
 */
function addConfigDataRows({ worksheet, farm_name, dateRange, expenseTypes, revenueTypes }) {
  // First row of data
  worksheet.addRow([farm_name, dateRange, expenseTypes.shift(), revenueTypes.shift()]);

  // Add remaining expense + revenue types in a column
  const maxRows = Math.max(expenseTypes.length, revenueTypes.length);
  for (let i = 0; i < maxRows; i++) {
    worksheet.addRow(['', '', expenseTypes[i] || '', revenueTypes[i] || '']);
  }
}

/**
 * Formats a date string according to the specified language.
 *
 * @param {string} date - The date string to format.
 * @param {string} [language='en'] - The language code for formatting.
 * @returns {string} - The formatted date string.
 */
const formatDate = (date, language = 'en') => {
  return new Date(date).toLocaleDateString(language);
};

/**
 * Converts each filter type object into an array of type ids to store less data in the database
 *
 * @param {Object} filters - The filters config object
 * @returns {Object} Object where each filter type contains an array of active type ids
 *
 */
export const formatTypeFilters = (filterConfig) => {
  const formattedFilters = {};

  for (const [filterType, filterList] of Object.entries(filterConfig)) {
    if (!filterList) {
      continue; // Skip if filterList is undefined
    }
    const activeFilterIds = Object.entries(filterList)
      .map(([id, filter]) => (filter.active ? id : null))
      .filter(Boolean);

    formattedFilters[filterType] = activeFilterIds;
  }

  return formattedFilters;
};
