const recordDGenerator = require('./record_d_generation');
module.exports = (nextQueue, emailQueue) => (job) => {
  console.log('STEP 2 > EXCEL GENERATE', job.id);
  console.log('STEP 2 > EXCEL GENERATE', job.data);
  return recordDGenerator(job.data.records, job.data.farm_id)
    .then(() => {
      return nextQueue.add(job.data)
    })
    .catch((e) => {
      console.log('EXCEL FAILED')
      console.log(e)
      return emailQueue.add({ fail: true, email: job.data.email })
    })
}