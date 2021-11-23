const { spawn }= require('child_process')
const path = require('path');
module.exports = (nextQueue, emailQueue) => (job, done) => {
  console.log('STEP 4 > ZIP', job.id);
  const { farm_name, email } = job.data;
  const zipProcess = spawn('zip',
    ['-r', '-j', `${farm_name}.zip`, `${farm_name}`], { cwd: path.join(process.env.EXPORT_WD, 'temp') });
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
