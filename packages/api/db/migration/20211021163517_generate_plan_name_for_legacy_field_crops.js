export const up = async function (knex) {
  // selected name = 'NA' because that value exists on beta
  const managementPlans = await knex.raw(`
    select management_plan_id, crop_variety_id
      from management_plan
      where name is null or name = 'NA'
      order by crop_variety_id, management_plan_id;
  `);
  const varietyToPlanMap = managementPlans.rows.reduce((acc, row) => {
    const { management_plan_id, crop_variety_id } = row;
    if (!acc[crop_variety_id]) {
      acc[crop_variety_id] = [];
    }
    acc[crop_variety_id].push(management_plan_id);
    return acc;
  }, {});

  const updates = [];
  // eslint-disable-next-line no-unused-vars
  for (const [cropVarietyId, planIds] of Object.entries(varietyToPlanMap)) {
    let counter = 1;
    for (const planId of planIds) {
      updates.push(
        knex('management_plan')
          .where({ management_plan_id: planId })
          .update({ name: `Plan ${counter++}` }),
      );
    }
  }
  await Promise.all(updates);
};

// eslint-disable-next-line no-unused-vars
export const down = async function (knex) {};
