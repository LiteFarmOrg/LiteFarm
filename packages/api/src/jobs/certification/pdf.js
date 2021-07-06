const puppeteer = require('puppeteer');
const fs = require('fs');
const rp = require('request-promise');
const surveyStackURL = 'https://app.surveystack.io/api/';
module.exports = (nextQueue, emailQueue) => async (job) => {
  const { farm_id } = job.data;
  const browser = await puppeteer.launch({ headless: true });
  const submission = await rp({ uri: `${surveyStackURL}/submissions/${job.data.submission}`, json: true });
  const survey = await rp({ uri: `${surveyStackURL}/surveys/${submission.meta.survey.id}`, json: true });
  if(!submission || !survey) {
    emailQueue.add({ fail: true });
    return Promise.resolve();
  }
  const questionAnswerMap = survey.revisions[survey.revisions.length - 1].controls.reduce((obj, { label, name }) => ({
    ...obj,
    [label] : submission.data[name].value,
  }), {});

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((data) => {
      window.data = data;
    }, questionAnswerMap);
    await page.goto(process.env.REPORT_URL, { waitUntil: 'networkidle2' });
    const readablePDF = await page.createPDFStream({ format: 'a4' });
    const writePDFStream = fs.createWriteStream(`${process.env.EXPORT_WD}/temp/${farm_id}/export.pdf`);
    readablePDF.pipe(writePDFStream);
    nextQueue.add(job.data);
    setTimeout(() => {
      return browser.close();
    }, 1000)
  } catch (e) {
    emailQueue.add({ fail: true });
    return browser.close();
  }
}