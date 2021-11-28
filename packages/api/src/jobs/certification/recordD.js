const recordDGenerator = require('./record_d_generation');
const recordIGeneration = require('./record_i_generation');
const i18n = require('../locales/i18n');
module.exports = (nextQueue, zipQueue, emailQueue) => (job) => {
  console.log('STEP 2 > EXCEL GENERATE', job.id);
  const {
    recordD,
    recordICrops,
    recordICleaners,
    exportId,
    from_date,
    to_date,
    farm_name,
    language_preference,
  } = job.data;
  return i18n.changeLanguage(language_preference).then(() => Promise.all([
    recordDGenerator(recordD, exportId, from_date, to_date, farm_name),
    recordIGeneration(recordICrops, exportId, from_date, to_date, farm_name, true),
    recordIGeneration(recordICleaners, exportId, from_date, to_date, farm_name),
  ])).then(() => {
    if (job.data.submission) {
      return Promise.resolve(nextQueue.add(job.data, { removeOnComplete: true }));
    }
    return Promise.resolve(zipQueue.add(job.data, { removeOnComplete: true }));
  }).catch((e) => {
    console.log(e)
    return Promise.resolve(emailQueue.add({ fail: true, email: job.data.email }, { removeOnComplete: true }));
  })
}

