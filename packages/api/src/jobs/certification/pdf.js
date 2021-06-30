module.exports = (nextQueue) => (job, done) => {
  setTimeout(() => {
    console.log(`PDF ID:  ${job.id}`);
    console.log(`PDF data ${JSON.stringify(job.data)}`);
    nextQueue.add({ param: 'string from PDF' });
    done();
  }, 2000)
}