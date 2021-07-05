const { spawn }= require('child_process')
module.exports = (nextQueue, emailQueue) => (job, done) => {
  const { farm_id, email } = job.data;
  const zipProcess = spawn('tar',
    ['-cvzf', `${farm_id}.zip`, `temp/${farm_id}`], { cwd: process.env.EXPORT_WD });
  zipProcess.on('exit', childProcessExitCheck(() => {
    nextQueue.add({ file: `${farm_id}.zip` });
    done();
  }, () => {
    emailQueue.add({ fail: true, email });
    done();
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
