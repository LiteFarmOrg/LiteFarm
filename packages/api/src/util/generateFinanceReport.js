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

  const expenseTypes = generateTypeCountAndList(config.typesFilter.EXPENSE_TYPE);
  const revenueTypes = generateTypeCountAndList(config.typesFilter.REVENUE_TYPE);

  const dateRange = `${formatDate(config.dateFilter.startDate, language)} - ${formatDate(
    config.dateFilter.endDate,
    language,
  )}`;

  addConfigDataRows({
    worksheet,
    configSheetHeaders,
    farm_name,
    dateRange,
    expenseTypes,
    revenueTypes,
  });

  setWorksheetColumnWidths(worksheet, [18, 56]);
  worksheet.columns.forEach((column) => {
    column.eachCell((cell) => {
      cell.alignment = { wrapText: true, vertical: 'top' };
    });
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
 * Formats the active count and lists the active type labels from a given filter configuration
 *
 * @param {Object} typeList - The object of filter configurations for a specific type (e.g. the configurations under EXPENSE_TYPE or REVENUE_TYPE). Each key (type ID) in this object corresponds to an object with 'active' and 'label' attributes
 * @returns {string} A formatted string showing the active count over total count, followed by a comma-separated list of the active type labels
 * */
function generateTypeCountAndList(typeList) {
  if (!typeList) return '';

  const allTypes = Object.values(typeList);
  const activeTypes = allTypes.filter(({ active }) => active);
  return (
    `(${activeTypes.length}/${allTypes.length}) ` + activeTypes.map(({ label }) => label).join(', ')
  );
}

/**
 * Adds configuration data rows to the worksheet.
 *
 * @param {ExcelJS.Worksheet} worksheet - The configuration worksheet.
 * @param {Object} configSheetHeaders - Object containing the translated headers
 * @param {string} farm_name - The farm name.
 * @param {string} dateRange - The formatted date range.
 * @param {string[]} expenseTypes - Array of expense type labels.
 * @param {string[]} revenueTypes - Array of revenue type labels.
 */
function addConfigDataRows({
  worksheet,
  configSheetHeaders,
  farm_name,
  dateRange,
  expenseTypes,
  revenueTypes,
}) {
  worksheet.addRow([configSheetHeaders.farm, farm_name]);
  worksheet.addRow([configSheetHeaders.dates, dateRange]);
  worksheet.addRow(['', '']); // Empty row for spacing
  worksheet.addRow([configSheetHeaders.expenseTypes, expenseTypes]);
  worksheet.addRow([configSheetHeaders.revenueTypes, revenueTypes]);
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
