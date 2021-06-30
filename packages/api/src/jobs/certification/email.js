module.exports = (job, done) => {
  setTimeout(() => {
    console.log(`EMAIL ID:  ${job.id}`);
    console.log(`EMAIL data ${JSON.stringify(job.data)}`);
    done();
  }, 2000)
}