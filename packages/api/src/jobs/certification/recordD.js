const recordDGenerator = require('./record_d_generation');
module.exports = (nextQueue, emailQueue) => (job) => {
  console.log('STEP 2 > EXCEL GENERATE', job.id);
  return recordDGenerator(job.data.records, job.data.farm_id, job.data.from_date, job.data.to_date, job.data.farm_name)
    .then(() => {
      return Promise.resolve(nextQueue.add(job.data, { removeOnComplete: true }));
    })
    .catch((e) => {
      console.log(e)
      return Promise.resolve(emailQueue.add({ fail: true, email: job.data.email }, { removeOnComplete: true }));
    })
}