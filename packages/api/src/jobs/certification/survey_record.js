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

  const getQuestionInfo = (questionAnswerList) => {
    return questionAnswerList
      .map(({ label, name, type, hint, options, moreInfo }) => ({
        Question: label,
        Answer: submissionData.data[name].value,
        Type: type,
        Hint: hint,
        Instructions: type == 'instructions' ? options.source.replace(/<p>|<\/p>/g, '') : null, // Replace the <p> and </p> tags from the string
        Options: ['selectSingle', 'selectMultiple'].includes(type) ? options.source : null,
        MoreInfo: moreInfo,
      }))
      .filter((entry) => !['geoJSON', 'script', 'farmOsField'].includes(entry['Type']));
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
    return col, row;
  };

  const writeInstructions = (sheet, col, row, data) => {
    sheet
      .cell(`${col}${row}`)
      .value(data['Instructions'])
      .style({ fontFamily: 'Calibri', italic: true });
    return col, row;
  };

  const writeMultiOptionQs = (sheet, col, row, data) => {
    sheet.cell(`${col}${row}`).value(data['Question']).style({ fontFamily: 'Calibri', bold: true });
    if (data.Hint != null) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(data['Hint'])
        .style({ fontFamily: 'Calibri', italic: true });
    }
    if (data.MoreInfo != null) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(data['MoreInfo'])
        .style({ fontFamily: 'Calibri', italic: true });
    }
    for (const option of data['Options']) {
      sheet
        .cell(`${col}${(row += 1)}`)
        .value(option['value'])
        .style({ fontFamily: 'Calibri' });
      if (data['Answer'].includes(option['value'])) {
        sheet
          .cell(`${String.fromCharCode(col.charCodeAt(0) + 1)}${row}`)
          .value('X')
          .style({ fontFamily: 'Calibri' }); // Write 'X' to the right column
      }
    }
    return col, row;
  };

  const typeToFuncMap = {
    string: writeSimpleQs, // Text
    number: writeSimpleQs,
    //   'date': func3,
    location: writeSimpleQs,
    selectSingle: writeMultiOptionQs, // Multiple choice
    selectMultiple: writeMultiOptionQs, // Checkbox
    ontology: writeSimpleQs, //Dropdown
    //   'matrix': func6
    instructions: writeInstructions,
  };

  console.log('THIS IS THE QUESITON & ANSWERS', JSON.stringify(questionAnswerMap[0]));

  return XlsxPopulate.fromBlankAsync().then((workbook) => {
    // Populate the workbook.
    const sheet1 = workbook.sheet(0);
    var currentCol = 'A';
    var currentRow = 1;
    for (const qa of questionAnswerMap) {
      currentCol, (currentRow = typeToFuncMap[qa['Type']](sheet1, currentCol, currentRow, qa));
    }
    // Write to file.
    return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${exportId}/Survey Record.xlsx`);
  });
};
