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
  };
  const groupHeaderStyle = {
    fontFamily: 'Arial',
    bold: true,
    fontSize: 18,
  };
  const defaultStyle = {
    fontFamily: 'Calibri',
    fontSize: 12,
  };
  const titleStyle = {
    fontFamily: 'Calibri',
    fontSize: 20,
    bold: true,
  };

  const getQuestionInfo = (questionAnswerList) => {
    return questionAnswerList
      .map(({ label, name, type, hint, options, moreInfo, children }) => ({
        Question: label,
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

  const writeInstructions = (sheet, col, row, data) => {
    const instructions = data['Options']['source'].replace(/<p>|<\/p>/g, '');
    sheet
      .cell(`${col}${row}`)
      .value(instructions)
      .style({ ...defaultStyle, italic: true });
    return [col, row + 1];
  };

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

    row += 1;
    // Write column headers
    for (let i = 0; i < categories.length; i++) {
      sheet
        .cell(`${String.fromCharCode(col.charCodeAt(0) + i)}${row}`)
        .value(categories[i])
        .style({ ...defaultStyle, bold: true, border: { color: '000000', style: 'thick' } });
    }
    // Fill in the matrix
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

    return [col, row + 1];
  };

  const writeGroupOrPage = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style(groupHeaderStyle);
    // console.log("THIS IS THE CHILDREN: ", data['Children']);
    // const childInfo = data['Children']
    //     .map(({ label, name, type, hint, options, moreInfo, children }) => ({
    //     Question: label,
    //     Answer: submissionData.data[name].value,
    //     Type: type,
    //     Hint: hint,
    //     Options: options,
    //     MoreInfo: moreInfo,
    //     Children: ['group', 'page'].includes(type) ? children : null,
    //   }))
    //   .filter((entry) => !ignoredQuestions.includes(entry['Type']))
    // for (child in childInfo){
    //     [col, row] = typeToFuncMap[child['Type']](sheet, col, row + 1, child);
    //     row += 1;
    // }

    // return [col, row + 1];
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
    page: writeGroupOrPage,
    group: writeGroupOrPage,
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
    // Write to file.
    return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${exportId}/${surveyName}.xlsx`);
  });
};
