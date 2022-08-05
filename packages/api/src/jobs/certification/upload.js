const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getPrivateS3BucketName } = require('../../util/digitalOceanSpaces');

module.exports = (emailQueue) => (job, done) => {
  console.log('STEP 5 > Upload', job.id);
  const { exportId, farm_id, email } = job.data;
  const dateIdentifier = Date.now();
  const fileIdentifier = `${getPrivateS3BucketName()}/${farm_id}/document/exports/${dateIdentifier}`;
  const args = [
    's3', // command
    'cp', //sub command
    `temp/${exportId}.zip`, // location
    `s3://${fileIdentifier}.zip`, // destination
    '--endpoint=https://nyc3.digitaloceanspaces.com',
  ];
  const awsCopyProcess = spawn('aws', args, { cwd: process.env.EXPORT_WD });
  awsCopyProcess.on(
    'exit',
    childProcessExitCheck(
      () => {
        done();
        emailQueue.add({ ...job.data, file: fileIdentifier }, { removeOnComplete: true });
        fs.rmdir(path.join(process.env.EXPORT_WD, 'temp', exportId), { recursive: true }, (err) => {
          if (!err) console.log('deleted temp folder for export id', exportId);
        });
        fs.rm(
          path.join(process.env.EXPORT_WD, 'temp', `${exportId}.zip`),
          { recursive: true },
          (err) => {
            if (!err) console.log('deleted zip file for export id', exportId);
          },
        );
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
