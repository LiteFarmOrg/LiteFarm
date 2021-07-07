const { spawn }= require('child_process')
const bucketNames = {
  production: 'litefarm-app-secret',
  integration: 'litefarm-beta-secret',
  development: 'litefarm-dev-secret',
}

module.exports = (nextQueue, emailQueue) => (job, done) => {
  console.log('JOB DATA', JSON.stringify(job.data));
  console.log('STEP 1 > RETRIEVE DO', job.id);
  const { farm_id, files, email } = job.data;
  const args = [
    's3', // command
    'cp', //sub command
    `s3://${getS3BucketName()}/${farm_id}/document`, // location
    `temp/${farm_id}`, // destination
    '--recursive',
    '--endpoint=https://nyc3.digitaloceanspaces.com',
    '--exclude=*',
  ].concat(files.map((fileName) => `--include=${fileName.split('/').pop()}`))
  const awsCopyProcess = spawn('aws', args, { cwd: process.env.EXPORT_WD });
  awsCopyProcess.on('exit', childProcessExitCheck(() => {
    done();
    nextQueue.add(job.data, { removeOnComplete: true });
  }, ()=> {
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

function getS3BucketName() {
  const node_env = process.env.NODE_ENV;
  return bucketNames[node_env];
}
