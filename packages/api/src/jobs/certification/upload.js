import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getPrivateS3BucketName } from '../../util/digitalOceanSpaces.js';

export default (emailQueue) => (job, done) => {
  console.log('STEP 5 > Upload', job.id);
  const { exportId, farm_id, email } = job.data;
  const dateIdentifier = Date.now();
  const fileIdentifier = `${getPrivateS3BucketName()}/${farm_id}/document/exports/${dateIdentifier}`;
  const args = [
    's3', // command
    'cp', //sub command
    `temp/${exportId}.zip`, // location
    `s3://${fileIdentifier}.zip`, // destination
    `--endpoint=${
      process.env.NODE_ENV === 'development'
        ? process.env.MINIO_ENDPOINT
        : 'https://nyc3.digitaloceanspaces.com'
    }`,
  ];
  const awsCopyProcess = spawn('aws', args, { cwd: process.env.EXPORT_WD });

  // Receive informative error messages from the child process
  awsCopyProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  awsCopyProcess.on(
    'exit',
    childProcessExitCheck(
      () => {
        done();
        emailQueue.add({ ...job.data, file: fileIdentifier }, { removeOnComplete: true });
        fs.rm(path.join(process.env.EXPORT_WD, 'temp', exportId), { recursive: true }, (err) => {
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
