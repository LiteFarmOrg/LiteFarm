import * as dotenv from 'dotenv';
dotenv.config();

export const up = async function (knex) {
  const getCompleteDate = () => {
    switch (process.env.NODE_ENV) {
      case 'production':
        return '2021-10-31';
      case 'integration':
        return '2021-09-16';
      default:
        return undefined;
    }
  };
  const complete_date = getCompleteDate();
  if (complete_date) {
    const managementPlans = await knex('management_plan')
      .join(
        'crop_management_plan',
        'crop_management_plan.management_plan_id',
        'management_plan.management_plan_id',
      )
      .where({ complete_date })
      .whereRaw('management_plan.complete_date < crop_management_plan.harvest_date');
    await knex('management_plan')
      .whereIn(
        'management_plan_id',
        managementPlans.map(({ management_plan_id }) => management_plan_id),
      )
      .update({ complete_date: null });
  }
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex) {};
