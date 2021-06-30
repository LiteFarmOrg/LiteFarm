module.exports = (nextQueue) => (job, done) => {
  console.log('IN ZIP JOB')
  setTimeout(() => {
    console.log(`ZIP ID:  ${job.id}`);
    console.log(`ZIP data ${job.data}`);
    nextQueue.add({ param: 'string from ZIP' });
    done();
  }, 2000);

}