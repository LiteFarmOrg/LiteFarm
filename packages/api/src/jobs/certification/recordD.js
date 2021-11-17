const recordDGenerator = require('./record_d_generation');
const recordIGeneration = require('./record_i_generation');
module.exports = (nextQueue, zipQueue, emailQueue) => (job) => {
  console.log('STEP 2 > EXCEL GENERATE', job.id);
  return Promise.all([
    recordDGenerator(job.data.recordD, job.data.farm_id, job.data.from_date, job.data.to_date, job.data.farm_name),
    recordIGeneration(job.data.recordICrops, job.data.farm_id, job.data.from_date, job.data.to_date, job.data.farm_name, true),
    recordIGeneration(job.data.recordICleaners, job.data.farm_id, job.data.from_date, job.data.to_date, job.data.farm_name),
  ]).then(() => {
    if (job.data.submission) {
      return Promise.resolve(nextQueue.add(job.data, { removeOnComplete: true }));
    }
    return Promise.resolve(zipQueue.add(job.data, { removeOnComplete: true }));
  }).catch((e) => {
    console.log(e)
    return Promise.resolve(emailQueue.add({ fail: true, email: job.data.email }, { removeOnComplete: true }));
  })
}

