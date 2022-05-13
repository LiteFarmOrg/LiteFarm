// const puppeteer = require('puppeteer');
// const fs = require('fs');
const rp = require('request-promise');
const surveyStackURL = 'https://app.surveystack.io/api/';
module.exports = async (submission) => {
  console.log('STEP X > SURVEY RECORD');
  const submissionData = await rp({
    uri: `${surveyStackURL}/submissions/${submission}`,
    json: true,
  });
  const survey = await rp({
    uri: `${surveyStackURL}/surveys/${submissionData.meta.survey.id}`,
    json: true,
  });

  //   if (!submissionData || !survey) {
  //     emailQueue.add({ fail: true });
  //     return Promise.resolve();
  //   }

  const getQuestionsInfo = (questionAnswerList) => {
    return questionAnswerList.map(({ label, name, type }) => ({
      Question: label,
      Answer: submissionData.data[name].value,
      Type: type,
    }));
  };

  const questionAnswerMap = getQuestionsInfo(
    survey.revisions[survey.revisions.length - 1].controls,
  );

  console.log('THIS IS THE QUESITON & ANSWERS', questionAnswerMap);
};
