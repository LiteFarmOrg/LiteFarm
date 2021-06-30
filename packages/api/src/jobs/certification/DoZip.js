const { excelQueue } = require('./index')

module.exports = (job, done) => {
  console.log('IN ZIP JOB')
  setTimeout(() => {
    console.log(`ZIP ID:  ${job.id}`);
    console.log(`ZIP data ${job.data}`);
    excelQueue.add({ param: 'string from ZIP' });
    done();
  }, 2000);

}