import XlsxPopulate from 'xlsx-populate';
import rp from 'request-promise';
const surveyStackURL = 'https://app.surveystack.io/api/';

export default async (emailQueue, submission, exportId, organicCertifierSurvey, certifier) => {
  if (!submission) {
    emailQueue.add({ fail: true });
    return Promise.resolve();
  }

  const [submissionData] = await rp({
    uri: `${surveyStackURL}/submissions?survey=${certifier.survey_id}&match={"_id":{"$oid":"${submission}"}}`,
    json: true,
    headers: { Authorization: `${process.env.SURVEY_USER} ${process.env.SURVEY_TOKEN}` },
  });

  const survey = await rp({
    uri: `${surveyStackURL}/surveys/${certifier.survey_id}`,
    json: true,
    headers: { Authorization: `${process.env.SURVEY_USER} ${process.env.SURVEY_TOKEN}` },
  });

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

  const getGroupBorder = (direction) => {
    return {
      [`${direction}Border`]: {
        color: '000000',
        style: 'thin',
      },
      leftBorder: {
        color: '000000',
        style: 'thin',
      },
      rightBorder: {
        color: '000000',
        style: 'thin',
      },
    };
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
    border: { color: '000000', style: 'thick' },
  };

  /**
   * Traverse down nested groups to get the answer of a question.
   * If a question is not nested in a group, no traversing is done.
   */
  const getNestedAnswer = (parentGroups, name) => {
    let answer = submissionData.data;
    for (const group of parentGroups) {
      if (group != null) {
        answer = answer[group];
      }
    }
    return answer[name]?.value;
  };

  const getQuestionInfo = (questionAnswerList, groupName = null, prevParentGroups = []) => {
    return questionAnswerList
      .map(({ label, name, type, hint, options, moreInfo, children }) => ({
        Question: label,
        Name: name,
        ParentGroups: [...prevParentGroups, groupName],
        Answer: getNestedAnswer([...prevParentGroups, groupName], name),
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
    return [col, row, 1];
  };

  /**
   * Write all the selected options from the dropdown question as subsequent rows
   */
  const writeDropdownQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style(questionStyle);

    if (data['Answer'] != null) {
      for (const answer of data['Answer']) {
        sheet
          .cell(`${col}${(row += 1)}`)
          .value(answer)
          .style(defaultStyle);
      }
    }
    return [col, row, 1];
  };

  /**
   * Write date questions in the full format
   */
  const writeDateQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style(questionStyle);
    if (data['Answer'] != null) {
      const date = new Date(data['Answer']).toDateString();
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(date)
        .style(defaultStyle);
    }
    return [col, row, 1];
  };

  /**
   * Write instructions in italics
   */
  const writeInstructions = (sheet, col, row, data) => {
    const instructions = data['Options']['source'].replace(/<p>|<\/p>/g, '');
    sheet
      .cell(`${col}${row}`)
      .value(instructions)
      .style({ ...defaultStyle, italic: true });
    return [col, row, 1];
  };

  /**
   * Write multiple choice/checkbox type questions to the Excel Sheet.
   * Label is in the left column and a 'X' is placed in the immediate right column if this option was selected
   */
  const writeMultiOptionQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style(questionStyle);
    if (![null, '', undefined].includes(data['Hint'])) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(`Hint: ${data['Hint']}`)
        .style({ ...defaultStyle, italic: true });
    }
    if (![null, '', undefined].includes(data['MoreInfo'])) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(`Extra Info: ${data['MoreInfo']}`)
        .style({ ...defaultStyle, italic: true });
    }

    if (data['Answer'] != null) {
      const nonCustomAnswers = data['Options']['source'];
      for (const ncAnswer of nonCustomAnswers) {
        sheet
          .cell(`${col}${(row += 1)}`)
          .value(ncAnswer['label'])
          .style(defaultStyle);
        if (data['Answer'].includes(ncAnswer['value'])) {
          sheet
            .cell(`${String.fromCharCode(col.charCodeAt(0) + 1)}${row}`)
            .value('X')
            .style(defaultStyle); // Write 'X' to the right column
        }
      }

      // Get the difference between given answers and all non-custom answers.
      // If this list is non-empty, we know the user gave a custom answer

      const customEntry = data['Answer'].filter(
        (answer) => !nonCustomAnswers.map((ncAnswer) => ncAnswer['value']).includes(answer),
      );

      if (customEntry.length != 0) {
        sheet
          .cell(`${col}${(row += 1)}`)
          .value(customEntry[0])
          .style(defaultStyle);

        sheet
          .cell(`${String.fromCharCode(col.charCodeAt(0) + 1)}${row}`)
          .value('X')
          .style(defaultStyle);
      }
    }

    return [col, row, 2];
  };

  /**
   * Write a matrix question to the sheet in the same format as the matrix.
   * Only include the valid question types
   */
  const writeMatrixQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style(questionStyle);
    if (![null, '', undefined].includes(data['Hint'])) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(`Hint: ${data['Hint']}`)
        .style({ ...defaultStyle, italic: true });
    }

    if (![null, '', undefined].includes(data['MoreInfo'])) {
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
    return [col, row, categories.length];
  };

  /**
   * Write groups or pages to the Excel sheet with special formatting
   */
  const writeCollection = (sheet, col, row, data) => {
    sheet
      .cell(`${col}${row}`)
      .value(data['Question'])
      .style({ ...groupHeaderStyle, ...getGroupBorder('top') });
    const childInfo = getQuestionInfo(data['Children'], data['Name'], data['ParentGroups']);
    var [currentFarthestCol, farthestCol] = [1, 1];
    for (const child of childInfo) {
      [col, row, currentFarthestCol] = typeToFuncMap[child['Type']](sheet, col, row + 2, child);
      farthestCol = Math.max(currentFarthestCol, farthestCol);
    }
    sheet.cell(`${col}${row}`).style(getGroupBorder('bottom'));

    return [col, row, farthestCol];
  };

  const writeLocationQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style(questionStyle);
    if (data['Answer'] != null) {
      const longLat = data['Answer']['geometry']['coordinates'];
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(`Longitude:${longLat[0]}, Latitude:${longLat[1]}`)
        .style(defaultStyle);
    }
    return [col, row, 1];
  };

  const typeToFuncMap = {
    string: writeSimpleQs, // Text
    number: writeSimpleQs,
    ontology: writeDropdownQs, //Dropdown
    location: writeLocationQs,
    date: writeDateQs,
    selectSingle: writeMultiOptionQs, // Multiple choice
    selectMultiple: writeMultiOptionQs, // Checkbox
    matrix: writeMatrixQs,
    instructions: writeInstructions,
    page: writeCollection,
    group: writeCollection,
  };

  return XlsxPopulate.fromBlankAsync().then((workbook) => {
    // Populate the workbook.
    const mainSheet = workbook.sheet(0);
    const surveyName = survey['name'];
    var [currentCol, currentRow, farthestCol, currentFarthestCol] = ['A', 1, 1, 1];

    // Write the survey_id and farm_id
    mainSheet
      .cell(`A${currentRow}`)
      .value(`Survey ID: ${submissionData.meta.survey.id}`)
      .style(defaultStyle);
    mainSheet
      .cell(`A${(currentRow += 1)}`)
      .value(`Farm ID: ${organicCertifierSurvey.farm_id}`)
      .style(defaultStyle);

    // Write the title
    mainSheet
      .cell(`A${(currentRow += 1)}`)
      .value(surveyName)
      .style(titleStyle);
    currentRow += 2;
    for (const qa of questionAnswerMap) {
      [currentCol, currentRow, currentFarthestCol] = typeToFuncMap[qa['Type']](
        mainSheet,
        currentCol,
        currentRow,
        qa,
      );
      currentRow += 2;
      farthestCol = Math.max(currentFarthestCol, farthestCol);
    }
    // Resize cells
    for (let i = 0; i < farthestCol; i++) {
      const colToResize = String.fromCharCode('A'.charCodeAt(0) + i);
      const maxStringLength = mainSheet
        .range(`${colToResize}1:${colToResize}${currentRow}`)
        .reduce((max, cell) => {
          const value = cell.value() == null ? '' : cell.value();
          if (value === undefined) return max;
          return Math.max(max, value.toString().length);
        }, 0);

      mainSheet.column(colToResize).width(maxStringLength * (titleStyle.fontSize / 12));
    }

    // Write to file.
    return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${exportId}/${surveyName}.xlsx`);
  });
};
