const { spawn }= require('child_process')
const bucketNames = {
  production: 'litefarm-app-secret',
  integration: 'litefarm-beta-secret',
  development: 'litefarm-dev-secret',
}

module.exports = (emailQueue) => (job, done) => {
  console.log('STEP 4 > Upload', job.id);
  const { farm_id, email } = job.data;
  const dateIdentifier = Date.now();
  const fileIdentifier = `${getS3BucketName()}/${farm_id}/document/exports/${dateIdentifier}`
  const args = [
    's3', // command
    'cp', //sub command
    `${farm_id}.zip`, // destination
    `s3://${fileIdentifier}`, // location
    '--endpoint=https://nyc3.digitaloceanspaces.com',
  ]
  const awsCopyProcess = spawn('aws', args, { cwd: process.env.EXPORT_WD });
  awsCopyProcess.on('exit', childProcessExitCheck(() => {
    emailQueue.add({ data: job.data, file: fileIdentifier });
    done();
  }, ()=> {
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

function getS3BucketName() {
  const node_env = process.env.NODE_ENV;
  return bucketNames[node_env];
}