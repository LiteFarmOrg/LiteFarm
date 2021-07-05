module.exports = (job, done) => {
  setTimeout(() => {
    console.log(`EMAIL ID:  ${job.id}`);
    console.log(`EMAIL data ${JSON.stringify(job.data)}`);
    console.log(`Uploaded file ${job.data.file}`);
    done();
  }, 2000)
}