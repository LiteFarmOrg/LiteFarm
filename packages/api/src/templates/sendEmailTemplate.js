/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (sendEmailTemplate.js) is part of LiteFarm.
 *  
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *  
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

const nodemailer = require('nodemailer');
const credentials = require('../credentials');
const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class sendEmailTemplate {
  static async sendEmail(template_path, subject, replacements, email, sender, modifyHTML=false, joinURL=null) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        clientId: credentials.LiteFarm_Service_Gmail.client_id,
        clientSecret: credentials.LiteFarm_Service_Gmail.client_secret,
      },
    });

    const filePath = path.join(__dirname, template_path);
    const html = await fs.readFile(filePath, 'utf8');

    // this compiles the html file, but template itself is a function
    let template = handlebars.compile(html);

    // after this the template is converted to strings
    let htmlToSend = template(replacements);

    // this changes the join button href for invite a user email
    const html_templates = ['../templates/invitation_to_farm_email.html', "../templates/send_confirmation_email.html", "../templates/withheld_consent_email.html"]
    if(html_templates.includes(template_path)){
      // using JSDOM to dynamically set the href for the Join button
      let dom = new JSDOM(htmlToSend);

      if(modifyHTML){
        dom.window.document.getElementById('email-button').setAttribute('href', joinURL);
      }else{
        const environment = process.env.NODE_ENV || 'development';
        let homeUrl;
        // preferably with a switch case, but writing if statements is faster :)
        if(environment === 'integration'){
          homeUrl = 'https://beta.litefarm.org';
        }else if(environment === 'production'){
          homeUrl = 'https://www.litefarm.org';
        }else if(environment === 'development'){
          homeUrl = 'localhost:3000'
        }
        dom.window.document.getElementById('email-button').setAttribute('href', homeUrl);
      }
      // this exports the dom back to a string
      htmlToSend = dom.serialize();
    }

    const MailInfo = {
      from: 'LiteFarm <' + sender + '>',
      to: email,
      subject,
      html: htmlToSend,
      auth: {
        user: 'system@litefarm.org',
        refreshToken: credentials.LiteFarm_Service_Gmail.refresh_token,
      },
    };

    transporter.sendMail(MailInfo, function (error, info) {
      if (error) {
        return console.log(error)
      }
      console.log('Message sent: ' + info.response);
    });

  }
}

module.exports = sendEmailTemplate;
