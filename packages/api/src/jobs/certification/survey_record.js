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

  const defaultStyles = {
    verticalAlignment: 'center',
    fontFamily: 'Calibri',
  };

  console.log('THIS IS THE QUESITON & ANSWERS', questionAnswerMap);

  return XlsxPopulate.fromBlankAsync().then((workbook) => {
    // Populate the workbook.
    const sheet1 = workbook.sheet(0);
    var currentRow = 1;
    for (const qa of questionAnswerMap) {
      sheet1
        .cell(`A${currentRow++}`)
        .value(qa['Question'])
        .style(defaultStyles);
      sheet1
        .cell(`A${currentRow++}`)
        .value(qa['Answer'])
        .style(defaultStyles);
    }
    // Write to file.
    return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${exportId}/Survey Record.xlsx`);
  });
};
