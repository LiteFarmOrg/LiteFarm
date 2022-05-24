const { createToken } = require('../util/jwt');
const { emails, sendEmail } = require('../templates/sendEmailTemplate');
const Model = require('objection').Model;

class emailTokenModel extends Model {
  static get tableName() {
    return 'emailToken';
  }

  static get idColumn() {
    return ['invitation_id'];
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
        created_at: { type: 'date-time' },
        updated_at: { type: 'date-time' },
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
    if (!emailSent || emailSent.times_sent < 3) {
      const timesSent = emailSent && emailSent.times_sent ? ++emailSent.times_sent : 1;
      if (timesSent === 1) {
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
      { sender, buttonLink: `/callback/?invite_token=${token}` },
    );
  }
}

module.exports = emailTokenModel;
