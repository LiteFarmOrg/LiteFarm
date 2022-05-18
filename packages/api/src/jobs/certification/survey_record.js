const XlsxPopulate = require('xlsx-populate');

const rp = require('request-promise');
const surveyStackURL = 'https://app.surveystack.io/api/';
module.exports = async (submission, exportId) => {
  console.log('STEP X > SURVEY RECORD');

  const submissionData = await rp({
    uri: `${surveyStackURL}/submissions/${submission}`,
    json: true,
    headers: { Authorization: 'ashaikh@litefarm.org' },
  });

  const survey = await rp({
    uri: `${surveyStackURL}/surveys/${submissionData.meta.survey.id}`,
    json: true,
    headers: { Authorization: '<user-email> <user-token>' },
  });

  console.log('THIS IS THE SUBMISSION DATA: ', submissionData);
  console.log(
    'THIS IS THE WHOLE SURVEY INFORMATION: ',
    survey.revisions[survey.revisions.length - 1].controls,
  );

  const ignoredQuestions = [
    'geoJSON',
    'script',
    'FarmOS Field',
    'farmOsField',
    'farmOsPlanting',
    'farmOsFarm',
    'FarmOS Planting',
    'instructionsImageSplit',
  ];
  const questionStyle = {
    fontFamily: 'Calibri',
    bold: true,
    fontSize: 14,
    horizontalAlignment: 'left',
  };
  const groupHeaderStyle = {
    fontFamily: 'Calibri',
    bold: true,
    fontSize: 18,
    horizontalAlignment: 'center',
  };
  const defaultStyle = {
    fontFamily: 'Calibri',
    fontSize: 12,
    horizontalAlignment: 'left',
  };
  const titleStyle = {
    fontFamily: 'Calibri',
    fontSize: 20,
    bold: true,
    horizontalAlignment: 'center',
  };

  const getQuestionInfo = (questionAnswerList) => {
    return questionAnswerList
      .map(({ label, name, type, hint, options, moreInfo, children }) => ({
        Question: label,
        Name: name,
        Answer: submissionData.data[name].value,
        Type: type,
        Hint: hint,
        Options: options,
        MoreInfo: moreInfo,
        Children: ['group', 'page'].includes(type) ? children : null,
      }))
      .filter((entry) => !ignoredQuestions.includes(entry['Type']));
  };

  const questionAnswerMap = getQuestionInfo(survey.revisions[survey.revisions.length - 1].controls);

  /**
   * Writes the question in bold and answer without bolding to Excel sheet at the position specified by col and row
   */
  const writeSimpleQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style(questionStyle);

    sheet
      .cell(`${col}${(row += 1)}`)
      .value(data['Answer'])
      .style(defaultStyle);
    return [col, row];
  };

  const writeDropdownQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style(questionStyle);

    for (const answer of data['Answer']) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(answer)
        .style(defaultStyle);
    }
    return [col, row];
  };

  const writeDateQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style(questionStyle);

    const date = new Date(data['Answer']).toDateString();
    sheet
      .cell(`${col}${(row += 1)}`)
      .value(date)
      .style(defaultStyle);
    return [col, row];
  };

  // Write instructions in italics
  const writeInstructions = (sheet, col, row, data) => {
    const instructions = data['Options']['source'].replace(/<p>|<\/p>/g, '');
    sheet
      .cell(`${col}${row}`)
      .value(instructions)
      .style({ ...defaultStyle, italic: true });
    return [col, row + 1];
  };

  // Write multiple choice/checkbox type questions to the Excel Sheet.
  // Option is in the left column and a 'X' is placed in the immediate right column if this option was selected
  const writeMultiOptionQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style(questionStyle);
    if (data['Hint'] != null) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(`Hint: ${data['Hint']}`)
        .style({ ...defaultStyle, italic: true });
    }
    if (data['MoreInfo'] != null) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(`Extra Info: ${data['MoreInfo']}`)
        .style({ ...defaultStyle, italic: true });
    }
    const allChoices = data['Options']['source'];
    for (const option of allChoices) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(option['value'])
        .style(defaultStyle);
      if (data['Answer'] && data['Answer'].includes(option['value'])) {
        sheet
          .cell(`${String.fromCharCode(col.charCodeAt(0) + 1)}${row}`)
          .value('X')
          .style(defaultStyle); // Write 'X' to the right column
      }
    }

    // Get the difference between given answers and all non-custom answers.
    // If this list is non-empty, we know the user gave a custom answer
    const customEntry = data['Answer'].filter(
      (a) => !data['Options']['source'].map((s) => s['value']).includes(a),
    );

    if (customEntry != []) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(customEntry[0])
        .style(defaultStyle);

      sheet
        .cell(`${String.fromCharCode(col.charCodeAt(0) + 1)}${row}`)
        .value('X')
        .style(defaultStyle);
    }

    return [col, row + 1];
  };

  /**
   * Write a matrix question to the sheet in the same format as the matrix.
   * Only include the valid question types
   */
  const writeMatrixQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style(questionStyle);
    if (data['Hint'] != null) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(`Hint: ${data['Hint']}`)
        .style({ ...defaultStyle, italic: true });
    }

    if (data['MoreInfo'] != null) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(`Extra Info: ${data['MoreInfo']}`)
        .style({ ...defaultStyle, italic: true });
    }
    // Get all the valid types of questions in the matrix
    const categories = data['Options']['source']['content']
      .map((c) => c['value'])
      .filter((c) => !ignoredQuestions.includes(c));

    const labels = data['Options']['source']['content']
      .map((c) => c['label'])
      .filter((c) => !ignoredQuestions.includes(c));

    row += 1;
    // Write column headers
    for (let i = 0; i < categories.length; i++) {
      sheet
        .cell(`${String.fromCharCode(col.charCodeAt(0) + i)}${row}`)
        .value(labels[i])
        .style({ ...defaultStyle, bold: true, border: { color: '000000', style: 'thick' } });
    }
    // Fill in the matrix
    if (data['Answer'] != null) {
      for (const answer of data['Answer']) {
        row += 1;
        for (let i = 0; i < categories.length; i++) {
          if (answer[categories[i]]) {
            // Check if this answer has valid type
            sheet
              .cell(`${String.fromCharCode(col.charCodeAt(0) + i)}${row}`)
              .value(answer[categories[i]]['value'])
              .style({ ...defaultStyle, border: { color: '000000', style: 'thin' } });
          }
        }
      }
    }
    return [col, row + 1];
  };

  const writeCollection = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style(groupHeaderStyle);
    const groupName = data['Name'];
    const childInfo = data['Children']
      .map(({ label, name, type, hint, options, moreInfo, children }) => ({
        Question: label,
        Answer: submissionData.data[groupName][name].value,
        Type: type,
        Hint: hint,
        Options: options,
        MoreInfo: moreInfo,
        Children: ['group', 'page'].includes(type) ? children : null,
      }))
      .filter((entry) => !ignoredQuestions.includes(entry['Type']));
    // console.log("THESE ARE THE CHILDREN: ", childInfo);
    for (const child of childInfo) {
      [col, row] = typeToFuncMap[child['Type']](sheet, col, row + 1, child);
      // row += 1;
    }

    return [col, row + 1];
  };

  const typeToFuncMap = {
    string: writeSimpleQs, // Text
    number: writeSimpleQs,
    ontology: writeDropdownQs, //Dropdown
    location: writeSimpleQs,
    date: writeDateQs,
    selectSingle: writeMultiOptionQs, // Multiple choice
    selectMultiple: writeMultiOptionQs, // Checkbox
    matrix: writeMatrixQs,
    instructions: writeInstructions,
    page: writeCollection,
    group: writeCollection,
  };

  console.log('THIS IS THE QUESTION & ANSWERS', questionAnswerMap);

  return XlsxPopulate.fromBlankAsync().then((workbook) => {
    // Populate the workbook.
    const mainSheet = workbook.sheet(0);
    const surveyName = survey['name'];
    var currentCol = 'A';
    var currentRow = 1;
    mainSheet.cell(`${currentCol}${currentRow}`).value(surveyName).style(titleStyle);
    currentRow += 1;
    for (const qa of questionAnswerMap) {
      [currentCol, currentRow] = typeToFuncMap[qa['Type']](mainSheet, currentCol, currentRow, qa);
      currentRow += 1;
    }
    // Resize cells
    const maxStringLength = mainSheet.range(`A1:A${currentRow}`).reduce((max, cell) => {
      const value = cell.value() == null ? '' : cell.value();
      if (value === undefined) return max;
      return Math.max(max, value.toString().length);
    }, 0);

    // For the default font settings in Excel, 1 char -> 1 pt is a pretty good estimate.
    mainSheet.column('A').width(maxStringLength * (titleStyle.fontSize / 12));

    // Write to file.
    return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${exportId}/${surveyName}.xlsx`);
  });
};
