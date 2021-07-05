const { spawn }= require('child_process')
const bucketNames = {
  production: 'litefarm-app-secret',
  integration: 'litefarm-beta-secret',
  development: 'litefarm-dev-secret',
}

module.exports = (nextQueue, emailQueue) => (job, done) => {
  const { farm_id, files, email } = job.data;
  const args = [
    's3', // command
    'cp', //sub command
    `s3://${getS3BucketName()}/${farm_id}/document`, // location
    `temp/${farm_id}`, // destination
    '--recursive',
    '--endpoint=https://nyc3.digitaloceanspaces.com',
    '--exclude=*',
  ].concat(files.map((fileName) => `--include=${fileName}`))
  const awsCopyProcess = spawn('aws', args, { cwd: process.env.EXPORT_WD });
  awsCopyProcess.on('exit', childProcessExitCheck(() => {
    nextQueue.add({ data: job.data });
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
