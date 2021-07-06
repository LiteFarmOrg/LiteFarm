const { spawn }= require('child_process')
module.exports = (nextQueue, emailQueue) => (job, done) => {
  console.log('STEP 3 > ZIP', job.id);
  const { farm_id, email } = job.data;
  const zipProcess = spawn('zip',
    ['-r', `${farm_id}.zip`, `temp/${farm_id}`], { cwd: process.env.EXPORT_WD });
  zipProcess.on('exit', childProcessExitCheck(() => {
    done();
    nextQueue.add(job.data, { removeOnComplete: true });
  }, () => {
    done();
    emailQueue.add({ fail: true, email }, { removeOnComplete: true });
  }));
}

function childProcessExitCheck(successFn, failFn) {
  return (exitCode) => {
    if (exitCode !== 0) {
      return failFn();
    }
    successFn()
  }
}
