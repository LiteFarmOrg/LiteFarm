const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { getPrivateS3BucketName } = require('../../util/digitalOceanSpaces');

module.exports = (nextQueue, emailQueue) => (job, done) => {
  console.log('JOB DATA', JSON.stringify(job.data));
  console.log('STEP 1 > RETRIEVE DO', job.id);
  const { exportId, farm_id, files, email } = job.data;
  const args = [
    's3', // command
    'cp', //sub command
    `s3://${getPrivateS3BucketName()}/${farm_id}/document`, // location
    `temp/${exportId}`, // destination
    '--recursive',
    '--endpoint=https://nyc3.digitaloceanspaces.com',
    '--exclude=*',
  ].concat(files.map(({ url }) => `--include=${url.split('/').pop()}`));
  const awsCopyProcess = spawn('aws', args, { cwd: process.env.EXPORT_WD });
  awsCopyProcess.on(
    'exit',
    childProcessExitCheck(
      () => {
        const fileNames = files.map(({ url, file_name }) => ({
          oldName: url.split('/').pop(),
          newName: file_name,
        }));
        Promise.all(
          fileNames.map(({ oldName, newName }) => {
            const directory = path.join(process.env.EXPORT_WD, 'temp', exportId);
            return fs
              .stat(path.join(directory, oldName))
              .then(() => fs.rename(path.join(directory, oldName), path.join(directory, newName)))
              .catch(() => console.log('Could not find file', newName));
          }),
        ).then(() => {
          done();
          nextQueue.add(job.data, { removeOnComplete: true });
        });
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
