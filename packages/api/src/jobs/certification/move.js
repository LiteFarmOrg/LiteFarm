const { spawn }= require('child_process')

module.exports = (job, done) => {
  const { files, farm_id } = job.data;
  const fileNames = files.map(({ url, file_name }) => ({
    oldName: url.split('/').pop(),
    newName: file_name,
  }))
  fileNames.map(({ oldName, newName }, i) => {
    const spawnedProcess = spawn('mv', [oldName, newName], { cwd: `${process.env.EXPORT_MD}/temp/${farm_id}` });
    i === fileNames.length - 1 && spawnedProcess.on('exit', () => {
      done();
    })
  })
}