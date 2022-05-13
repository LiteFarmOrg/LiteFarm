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

  const getQuestionsInfo = (questionAnswerList) => {
    return questionAnswerList
      .map(({ label, name, type }) => ({
        Question: label,
        Answer: submissionData.data[name].value,
        Type: type,
      }))
      .filter((entry) => !['geoJSON', 'script', 'farmOsField'].includes(entry['Type']));
  };

  const questionAnswerMap = getQuestionsInfo(
    survey.revisions[survey.revisions.length - 1].controls,
  );

  /**
   * Writes the question in bold and answer without bolding to Excel sheet at the position specified by col and row
   */
  const simpleQuestionProcess = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style({ fontFamily: 'Calibri', bold: true });

    sheet
      .cell(`${col}${(row += 1)}`)
      .value(data['Answer'])
      .style({ fontFamily: 'Calibri' });
  };

  const typeToFuncMap = {
    string: simpleQuestionProcess, // Text
    number: simpleQuestionProcess,
    //   'date': func3,
    location: simpleQuestionProcess,
    //   'selectSingle': func4, // Multiple choice
    //   'ontology': func5, //Dropdown
    //   'matrix': func6
  };

  console.log('THIS IS THE QUESITON & ANSWERS', questionAnswerMap);

  return XlsxPopulate.fromBlankAsync().then((workbook) => {
    // Populate the workbook.
    const sheet1 = workbook.sheet(0);
    var currentCol = 'A';
    var currentRow = 1;
    for (const qa of questionAnswerMap) {
      //   sheet1
      //     .cell(`${currentCol}${currentRow++}`)
      //     .value(qa['Question'])
      //     .style(defaultStyles);
      //   sheet1
      //     .cell(`${currentCol}${currentRow++}`)
      //     .value(qa['Answer'])
      //     .style(defaultStyles);
      typeToFuncMap[qa['Type']](sheet1, currentCol, currentRow, qa);
      currentRow += 2;
    }
    // Write to file.
    return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${exportId}/Survey Record.xlsx`);
  });
};
