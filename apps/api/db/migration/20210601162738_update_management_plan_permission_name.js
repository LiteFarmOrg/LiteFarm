export const up = function (knex) {
  return Promise.all([
    knex('permissions').where({ name: 'add:field_crops' }).update({
      name: 'add:management_plan',
      description: 'add management plan',
    }),
    knex('permissions').where({ name: 'edit:field_crops' }).update({
      name: 'edit:management_plan',
      description: 'edit management plan',
    }),
    knex('permissions').where({ name: 'delete:field_crops' }).update({
      name: 'delete:management_plan',
      description: 'delete management plan',
    }),
    knex('permissions').where({ name: 'get:field_crops' }).update({
      name: 'get:management_plan',
      description: 'get management plan',
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex('permissions').where({ name: 'add:management_plan' }).update({
      name: 'add:field_crops',
      description: 'add field crops',
    }),
    knex('permissions').where({ name: 'edit:management_plan' }).update({
      name: 'edit:field_crops',
      description: 'edit field crops',
    }),
    knex('permissions').where({ name: 'delete:management_plan' }).update({
      name: 'delete:field_crops',
      description: 'delete field crops',
    }),
    knex('permissions').where({ name: 'get:management_plan' }).update({
      name: 'get:field_crops',
      description: 'get field crops',
    }),
  ]);
};
