// cypress/plugins/email-account.js
import nodemailer from 'nodemailer';
import imaps from 'imap-simple';
// used to parse emails from the inbox
import { simpleParser } from 'mailparser';

export const makeEmailAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  // use testAccount.user and testAccount.pass
  // to log in into the email inbox
  const emailConfig = {
    imap: {
      user: testAccount.user,
      password: testAccount.pass,
      host: 'imap.ethereal.email',
      port: 993,
      tls: true,
      authTimeout: 10000,
    },
  };

  console.log('created new email account %s', testAccount.user);
  console.log('for debugging, the password is %s', testAccount.pass);

  const userEmail = {
    email: testAccount.user,
    password: testAccount.pass,

    /**
     * Utility method for getting the last email
     * for the Ethereal email account created above.
     */
    async getLastEmail() {
      // makes debugging very simple
      console.log('getting the last email');
      console.log(emailConfig);

      try {
        const connection = await imaps.connect(emailConfig);

        // grab up to 50 emails from the inbox
        await connection.openBox('INBOX');
        const searchCriteria = ['1:50'];
        const fetchOptions = {
          bodies: [''],
        };
        const messages = await connection.search(searchCriteria, fetchOptions);
        // and close the connection to avoid it hanging
        connection.end();

        if (!messages.length) {
          console.log('cannot find any emails');
          return null;
        } else {
          console.log('there are %d messages', messages.length);
          // grab the last email
          const mail = await simpleParser(messages[messages.length - 1].parts[0].body);
          console.log(mail.subject);
          console.log(mail.text);

          // and returns the main fields
          return {
            subject: mail.subject,
            text: mail.text,
            html: mail.html,
          };
        }
      } catch (e) {
        console.error(e);
        return null;
      }
    },
  };

  return userEmail;
};
