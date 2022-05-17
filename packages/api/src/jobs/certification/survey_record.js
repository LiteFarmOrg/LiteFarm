const XlsxPopulate = require('xlsx-populate');

const rp = require('request-promise');
const surveyStackURL = 'https://app.surveystack.io/api/';
module.exports = async (submission, exportId) => {
  console.log('STEP X > SURVEY RECORD');

  const submissionData = await rp({
    uri: `${surveyStackURL}/submissions/${submission}`,
    json: true,
  });

  const survey = await rp({
    uri: `${surveyStackURL}/surveys/${submissionData.meta.survey.id}`,
    json: true,
  });

  console.log('THIS IS THE SUBMISSION DATA: ', submissionData);
  console.log(
    'THIS IS THE WHOLE SURVEY INFORMATION: ',
    survey.revisions[survey.revisions.length - 1].controls,
  );

  const ignoredQuestions = ['geoJSON', 'script', 'FarmOS Field', 'FarmOS Planting'];

  const getQuestionInfo = (questionAnswerList) => {
    return questionAnswerList
      .map(({ label, name, type, hint, options, moreInfo }) => ({
        Question: label,
        Answer: submissionData.data[name].value,
        Type: type,
        Hint: hint,
        Options: options,
        MoreInfo: moreInfo,
      }))
      .filter((entry) => !ignoredQuestions.includes(entry['Type']));
  };

  const questionAnswerMap = getQuestionInfo(survey.revisions[survey.revisions.length - 1].controls);

  /**
   * Writes the question in bold and answer without bolding to Excel sheet at the position specified by col and row
   */
  const writeSimpleQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style({ fontFamily: 'Calibri', bold: true });

    sheet
      .cell(`${col}${(row += 1)}`)
      .value(data['Answer'])
      .style({ fontFamily: 'Calibri' });
    return [col, row];
  };

  const writeInstructions = (sheet, col, row, data) => {
    const instructions = data['Options']['source'].replace(/<p>|<\/p>/g, '');
    sheet.cell(`${col}${row}`).value(instructions).style({ fontFamily: 'Calibri', italic: true });
    return [col, row + 1];
  };

  const writeMultiOptionQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style({ fontFamily: 'Calibri', bold: true });
    if (data.Hint != null) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(`Hint: ${data['Hint']}`)
        .style({ fontFamily: 'Calibri', italic: true });
    }
    if (data.MoreInfo != null) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(`Extra Info: ${data['MoreInfo']}`)
        .style({ fontFamily: 'Calibri', italic: true });
    }
    const allChoices = data['Options']['source'];
    for (const option of allChoices) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(option['value'])
        .style({ fontFamily: 'Calibri' });
      if (data['Answer'] && data['Answer'].includes(option['value'])) {
        sheet
          .cell(`${String.fromCharCode(col.charCodeAt(0) + 1)}${row}`)
          .value('X')
          .style({ fontFamily: 'Calibri' }); // Write 'X' to the right column
      }
    }
    return [col, row + 1];
  };

  const writeMatrixQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style({ fontFamily: 'Calibri', bold: true });
    const categories = data['Options']['source']['content']
      .map((c) => c['label'])
      .filter((c) => !ignoredQuestions.includes(c)); // Get all the valid types of questions in the matrix

    console.log('CATEGORIES: ', categories);

    row += 1;
    // Write column headers
    for (let i = 0; i < categories.length; i++) {
      sheet
        .cell(`${String.fromCharCode(col.charCodeAt(0) + i)}${row}`)
        .value(categories[i])
        .style({ fontFamily: 'Calibri', bold: true, border: { color: '000000', style: 'thick' } });
    }
    row += 1;
    // Fill in the matrix
    for (const answer of data['Answer']) {
      for (let i = 0; i < categories.length; i++) {
        if (answer[categories[i]]) {
          // Check if this answer has valid type
          sheet
            .cell(`${String.fromCharCode(col.charCodeAt(0) + i)}${row}`)
            .value(answer[categories[i]]['value'])
            .style({ fontFamily: 'Calibri', border: { color: '000000', style: 'thin' } });
        }
      }
    }

    return [col, row + 1];
  };

  const typeToFuncMap = {
    string: writeSimpleQs, // Text
    number: writeSimpleQs,
    ontology: writeSimpleQs, //Dropdown
    location: writeSimpleQs,
    date: writeSimpleQs,
    selectSingle: writeMultiOptionQs, // Multiple choice
    selectMultiple: writeMultiOptionQs, // Checkbox
    matrix: writeMatrixQs,
    instructions: writeInstructions,
  };

  console.log('THIS IS THE QUESITON & ANSWERS', JSON.stringify(questionAnswerMap[0]));

  return XlsxPopulate.fromBlankAsync().then((workbook) => {
    // Populate the workbook.
    const sheet1 = workbook.sheet(0);
    var currentCol = 'A';
    var currentRow = 1;
    for (const qa of questionAnswerMap) {
      [currentCol, currentRow] = typeToFuncMap[qa['Type']](sheet1, currentCol, currentRow, qa);
      currentRow += 1;
    }
    // Write to file.
    return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${exportId}/Survey Record.xlsx`);
  });
};
