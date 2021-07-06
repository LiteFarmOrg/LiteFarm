const { sendEmail, emails } = require('./../../templates/sendEmailTemplate')
module.exports = (job) => {
  const farm_name = job.data.records[0].notes.split('/')[0];
  const { first_name, email, file } = job.data;
  const buttonLink = `/export/${file.split('/').pop()}`;
  return sendEmail(emails.EXPORT_EMAIL, { first_name, farm_name }, email, {
    buttonLink,
  })
}