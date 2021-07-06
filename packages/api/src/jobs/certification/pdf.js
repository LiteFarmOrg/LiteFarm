module.exports = (nextQueue) => (job, done) => {
  setTimeout(() => {
    console.log(`PDF ID:  ${job.id}`);
    done();
    nextQueue.add(job.data, { removeOnComplete: true });
  }, 2000)
}