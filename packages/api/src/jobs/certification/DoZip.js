const { spawn }= require('child_process')
const bucketNames = {
  production: 'litefarm-app-secret',
  integration: 'litefarm-beta-secret',
  development: 'litefarm-dev-secret',
}

module.exports = (nextQueue) => (job, done) => {
  console.log('ENVS', process.env.NODE_ENV, process.env.EXPORT_WD);
  const { farm_id, files } = job.data;
  const args = [
    's3', // command
    'cp', //sub command
    `s3://${getS3BucketName()}/${farm_id}/document`, // location
    `temp/${farm_id}`, // destination
    '--recursive',
    '--endpoint=https://nyc3.digitaloceanspaces.com',
    '--exclude=*',
  ].concat(files.map((fileName) => `--include=${fileName}`))
  console.log(args);
  const awsCopyProcess = spawn('aws', args, { cwd: process.env.EXPORT_WD });
  awsCopyProcess.on('exit', childProcessExitCheck(() => {
    console.log('retrieved files');
    const zipProcess = spawn('tar',
      ['-cvzf', `${farm_id}.zip`, `temp/${farm_id}`], { cwd: process.env.EXPORT_WD });
    zipProcess.on('exit', childProcessExitCheck(() => {
      console.log('zipped files');
      nextQueue.add({ file: `${farm_id}.zip` });
      done();
    }, () =>  done()));
  }, ()=> done()));
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
