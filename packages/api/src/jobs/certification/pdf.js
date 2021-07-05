module.exports = (nextQueue) => (job, done) => {
  setTimeout(() => {
    console.log(`PDF ID:  ${job.id}`);
    nextQueue.add({ data: job.data });
    done();
  }, 2000)
}