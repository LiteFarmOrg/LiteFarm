import puppeteer from 'puppeteer';
import fs from 'fs';
import rp from 'request-promise';
const surveyStackURL = 'https://app.surveystack.io/api/';

export default (nextQueue, emailQueue) => async (job) => {
  console.log('STEP 3 > PDF');
  const {
    exportId,
    organicCertifierSurvey,
    certification,
    certifier,
    language_preference,
  } = job.data;
  const browser = await puppeteer.launch({
    headless: true,
    ignoreDefaultArgs: ['--disable-extensions'],
  });
  const submission = await rp({
    uri: `${surveyStackURL}/submissions/${job.data.submission}`,
    json: true,
  });
  const survey = await rp({
    uri: `${surveyStackURL}/surveys/${submission.meta.survey.id}`,
    json: true,
  });
  if (!submission || !survey) {
    emailQueue.add({ fail: true });
    return Promise.resolve();
  }
  const questionAnswerMap = survey.revisions[survey.revisions.length - 1].controls.reduce(
    (obj, { label, name }) => ({
      ...obj,
      [label]: submission.data[name].value,
    }),
    {},
  );

  try {
    const data = { questionAnswerMap, organicCertifierSurvey, certification, certifier };
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((data) => {
      // eslint-disable-next-line no-undef
      window.data = data;
    }, data);
    await page.goto(process.env.REPORT_URL);
    await page.evaluate((language_preference) => {
      // eslint-disable-next-line no-undef
      localStorage.setItem('litefarm_lang', language_preference);
    }, language_preference);
    await page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] });

    const readablePDF = await page.createPDFStream({ format: 'a4' });
    const writePDFStream = fs.createWriteStream(
      `${process.env.EXPORT_WD}/temp/${exportId}/Additional survey questions.pdf`,
    );
    readablePDF.pipe(writePDFStream);
    readablePDF.on('end', async () => {
      nextQueue.add(job.data);
      await browser.close();
    });
  } catch (e) {
    emailQueue.add({ fail: true });
    return browser.close();
  }
};
