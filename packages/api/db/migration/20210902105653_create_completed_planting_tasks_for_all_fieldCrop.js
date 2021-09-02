exports.up = async function(knex) {
  const managementPlans = await knex('management_plan');

};

exports.down = function(knex) {

};
