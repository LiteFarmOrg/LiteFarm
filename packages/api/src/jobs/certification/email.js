const { sendEmail, emails } = require('./../../templates/sendEmailTemplate')
module.exports = (job) => {
  if(!job.data?.fail) {
    const farm_name = job.data.records[0].notes.split('/')[0];
    const { first_name, email, file } = job.data;
    const buttonLink = `/export/${Buffer.from(file).toString('base64')}`;
    return sendEmail(emails.EXPORT_EMAIL, { first_name, farm_name }, email, {
      buttonLink,
    })
  } else {
    // Send failure email
    console.log('Failure');
    return Promise.resolve({});
  }
}