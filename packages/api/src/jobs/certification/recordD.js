const recordDGenerator = require('./record_d_generation');
module.exports = (nextQueue, emailQueue) => (job) => {
  return recordDGenerator(job.data.records)
    .then(() => {
      nextQueue.add({ data: job.data })
    })
    .catch(() => {
      emailQueue.add({ fail: true, email: job.data.email })
    })
}