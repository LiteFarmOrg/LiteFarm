import { spawn } from 'child_process';
import path from 'path';

export default (nextQueue, emailQueue) => (job, done) => {
  console.log('STEP 4 > ZIP', job.id);
  const { exportId, email } = job.data;
  const zipProcess = spawn('zip', ['-r', '-j', `${exportId}.zip`, `${exportId}`], {
    cwd: path.join(process.env.EXPORT_WD, 'temp'),
  });
  zipProcess.on(
    'exit',
    childProcessExitCheck(
      () => {
        done();
        nextQueue.add(job.data, { removeOnComplete: true });
      },
      () => {
        done();
        emailQueue.add({ fail: true, email }, { removeOnComplete: true });
      },
    ),
  );
};

function childProcessExitCheck(successFn, failFn) {
  return (exitCode) => {
    if (exitCode !== 0) {
      return failFn();
    }
    successFn();
  };
}
