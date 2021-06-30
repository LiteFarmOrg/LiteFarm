const { emailQueue } = require('./index')

module.exports = (job, done) => {
  setTimeout(() => {
    console.log(`PDF ID:  ${job.id}`);
    console.log(`PDF data ${JSON.stringify(job.data)}`);
    emailQueue.add({ param: 'string from PDF' });
    done();
  }, 2000)
}