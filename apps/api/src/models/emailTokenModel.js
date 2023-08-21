import { createToken } from '../util/jwt.js';
import { emails, sendEmail } from '../templates/sendEmailTemplate.js';
import Model from './baseFormatModel.js';

class emailTokenModel extends Model {
  static get tableName() {
    return 'emailToken';
  }

  static get idColumn() {
    return ['invitation_id'];
  }

  // Returned Date-time object from db is not compatible with ajv format types
  $parseJson(json, opt) {
    json = super.$parseJson(json, opt);
    if (json.created_at && typeof json.created_at === 'object') {
      json.created_at = json.created_at.toISOString();
    }
    if (json.updated_at && typeof json.updated_at === 'object') {
      json.updated_at = json.updated_at.toISOString();
    }
    return json;
  }

  async $beforeUpdate(opt, context) {
    await super.$beforeUpdate(opt, context);
    this.updated_at = new Date().toISOString();
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'farm_id'],

      properties: {
        user_id: { type: 'string' },
        farm_id: { type: 'string' },
        invitation_id: { type: 'string' },
        times_sent: { type: 'integer' },
        created_at: {
          type: 'string',
          format: 'date-time',
        },
        updated_at: {
          type: 'string',
          format: 'date-time',
        },
      },
      additionalProperties: false,
    };
  }

  static async createTokenSendEmail(user, userFarm, farm_name) {
    console.log('createTokenSendEmail');
    let token;
    const emailSent = await emailTokenModel
      .query()
      .where({
        user_id: userFarm.user_id,
        farm_id: userFarm.farm_id,
      })
      .first();

    // Reset times_sent if the last invitation was sent more than 24 hours ago
    let hasBeenReset;
    const now = new Date();
    const diffDays = Math.abs(now - emailSent?.updated_at) / (1000 * 60 * 60 * 24);
    if (diffDays > 1) {
      emailSent.times_sent = 0;
      hasBeenReset = true;
    }

    if (!emailSent || emailSent.times_sent < 3) {
      const timesSent = emailSent && emailSent.times_sent ? ++emailSent.times_sent : 1;

      if (timesSent === 1 && !hasBeenReset) {
        // If this is the first email, insert a new record into the emailToken table
        const emailToken = await emailTokenModel
          .query()
          .insert({
            user_id: userFarm.user_id,
            farm_id: userFarm.farm_id,
            times_sent: timesSent,
          })
          .returning('*');
        token = await createToken('invite', {
          ...user,
          ...userFarm,
          invitation_id: emailToken.invitation_id,
        });
      } else {
        // If subsequent email, patch the existing record
        const [emailToken] = await emailTokenModel
          .query()
          .patch({ times_sent: timesSent })
          .where({
            user_id: user.user_id,
            farm_id: userFarm.farm_id,
          })
          .returning('*');
        token = await createToken('invite', {
          ...user,
          ...userFarm,
          invitation_id: emailToken.invitation_id,
        });
      }
      await this.sendTokenEmail(farm_name, user, token);
    }
  }

  static async sendTokenEmail(farm, user, token) {
    const sender = 'system@litefarm.org';
    const template_path = emails.INVITATION;
    await sendEmail(
      template_path,
      { first_name: user.first_name, farm, locale: user.language_preference, farm_name: farm },
      user.email,
      {
        sender,
        buttonLink: `/callback/?invite_token=${token}&language=${user.language_preference}`,
      },
    );
  }
}

export default emailTokenModel;
