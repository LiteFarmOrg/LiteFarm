const { sendEmail, emails } = require('./../../templates/sendEmailTemplate')
module.exports = (job) => {
  if(!job.data?.fail) {
    const farm_name = job.data.records[0].notes.split('/')[0];
    const { first_name, email, file, farm_id } = job.data;
    const fileWithoutBucket = `${farm_id}${file.split(farm_id)[1]}`;
    const exportLink = `${Buffer.from(fileWithoutBucket).toString('base64')}`
    const buttonLink = `/export/${exportLink}`;
    return sendEmail(emails.EXPORT_EMAIL, { first_name, farm_name }, email, {
      buttonLink,
    })
  } else {
    // Send failure email
    console.log('Failure');
    return Promise.resolve({});
  }
}