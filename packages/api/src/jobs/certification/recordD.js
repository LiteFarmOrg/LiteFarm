
module.exports = (nextQueue) => (job, done) => {
  setTimeout(() => {
    console.log(`Excel ID:  ${job.id}`);
    console.log(`Excel data ${JSON.stringify(job.data)}`);
    nextQueue.add({ param: 'string from Excel' });
    done();
  }, 2000);

}