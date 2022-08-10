import recordDGenerator from './record_d_generation';
import recordAGenerator from './record_a_generation';
import recordIGeneration from './record_i_generation';
import readmeGeneration from './readmeGeneration';
import surveyRecordGeneration from './survey_record';
import i18n from '../locales/i18n';

export default (nextQueue, zipQueue, emailQueue) => (job) => {
  console.log('STEP 2 > EXCEL GENERATE', job.id);
  const {
    recordD,
    recordA,
    recordICrops,
    recordICleaners,
    exportId,
    from_date,
    to_date,
    farm_name,
    measurement,
    language_preference,
    submission,
    organicCertifierSurvey,
  } = job.data;
  return i18n
    .changeLanguage(language_preference)
    .then(() =>
      Promise.all([
        recordDGenerator(recordD, exportId, from_date, to_date, farm_name),
        recordIGeneration(recordICrops, exportId, from_date, to_date, farm_name, measurement, true),
        recordAGenerator(recordA, exportId, from_date, to_date, farm_name, measurement),
        recordIGeneration(recordICleaners, exportId, from_date, to_date, farm_name, measurement),
        readmeGeneration(exportId, language_preference),
        surveyRecordGeneration(emailQueue, submission, exportId, organicCertifierSurvey),
      ]),
    )
    .then(() => {
      if (job.data.submission) {
        return Promise.resolve(nextQueue.add(job.data, { removeOnComplete: true }));
      }
      return Promise.resolve(zipQueue.add(job.data, { removeOnComplete: true }));
    })
    .catch((e) => {
      console.log(e);
      return Promise.resolve(
        emailQueue.add({ fail: true, email: job.data.email }, { removeOnComplete: true }),
      );
    });
};
