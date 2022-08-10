import { sendEmail, emails } from './../../templates/sendEmailTemplate';

export default (job) => {
  if (!job.data?.fail) {
    const {
      first_name,
      email,
      file,
      farm_id,
      farm_name,
      from_date,
      to_date,
      language_preference,
    } = job.data;
    const fileWithoutBucket = `${farm_id}${file.split(farm_id)[1]}`;
    const exportLink = `${Buffer.from(fileWithoutBucket).toString('base64')}`;
    const buttonLink = `/export/${exportLink}/from/${from_date}/to/${to_date}`;
    return sendEmail(
      emails.EXPORT_EMAIL,
      { first_name, farm_name, locale: language_preference },
      email,
      {
        buttonLink,
      },
    );
  } else {
    // Send failure email
    console.log('Failure');
    return Promise.resolve({});
  }
};
