const { pdfQueue } = require('./index')

module.exports = (job, done) => {
  setTimeout(() => {
    console.log(`Excel ID:  ${job.id}`);
    console.log(`Excel data ${JSON.stringify(job.data)}`);
    pdfQueue.add({ param: 'string from Excel' });
    done();
  }, 2000);

}