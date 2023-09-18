import ExcelJS from 'exceljs';

const generateFinanceReport = (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  // Add data to worksheet
  worksheet.addRow(['Revenue', data.revenue]);
  worksheet.addRow(['Expenses', data.expenses]);
  worksheet.addRow(['Balance', data.balance]);

  return workbook;
};

export { generateFinanceReport };
