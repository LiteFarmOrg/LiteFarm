
exports.up = function(knex) {
  return Promise.all([
    knex.raw('ALTER TABLE "users" ALTER COLUMN user_id SET DEFAULT uuid_generate_v1();'),
    // knex.schema.alterTable('users', (table) => {
    //   table.uuid('user_id').notNullable().defaultTo(knex.raw('uuid_generate_v1()')).alter();
    // }),
    // knex.schema.alterTable('emailToken', (table) => {
    //   table.uuid('user_id').alter();
    // }),
    // knex.schema.alterTable('farm', (table) => {
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('userFarm', (table) => {
    //   table.uuid('user_id').alter();
    // }),
    // knex.schema.alterTable('shift', (table) => {
    //   table.uuid('user_id').alter();
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('activityLog', (table) => {
    //   table.uuid('user_id').alter();
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('organicCertifierSurvey', (table) => {
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('farmDataSchedule', (table) => {
    //   table.uuid('user_id').alter();
    // }),
    // knex.schema.alterTable('field', (table) => {
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('notification', (table) => {
    //   table.uuid('user_id').alter();
    // }),
    // knex.schema.alterTable('userTodo', (table) => {
    //   table.uuid('user_id').alter();
    // }),
    // knex.schema.alterTable('taskType', (table) => {
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('farmExpense', (table) => {
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('farmExpenseType', (table) => {
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('disease', (table) => {
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('pesticide', (table) => {
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('fertilizer', (table) => {
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('crop', (table) => {
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('fieldCrop', (table) => {
    //   table.uuid('created_by_user_id').alter();
    //   table.uuid('updated_by_user_id').alter();
    // }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.raw('ALTER TABLE "users" ALTER COLUMN user_id DROP DEFAULT;'),
    // knex.schema.alterTable('users', (table) => {
    //   table.string('user_id').alter();
    // }),
    // knex.schema.alterTable('emailToken', (table) => {
    //   table.string('user_id').alter();
    // }),
    // knex.schema.alterTable('farm', (table) => {
    //   table.string('user_id').alter();
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('userFarm', (table) => {
    //   table.string('user_id').alter();
    // }),
    // knex.schema.alterTable('shift', (table) => {
    //   table.string('user_id').alter();
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('activityLog', (table) => {
    //   table.string('user_id').alter();
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('organicCertifierSurvey', (table) => {
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('farmDataSchedule', (table) => {
    //   table.string('user_id').alter();
    // }),
    // knex.schema.alterTable('field', (table) => {
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('notification', (table) => {
    //   table.string('user_id').alter();
    // }),
    // knex.schema.alterTable('userTodo', (table) => {
    //   table.string('user_id').alter();
    // }),
    // knex.schema.alterTable('taskType', (table) => {
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('farmExpense', (table) => {
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('farmExpenseType', (table) => {
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('disease', (table) => {
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('pesticide', (table) => {
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('fertilizer', (table) => {
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('crop', (table) => {
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
    // knex.schema.alterTable('fieldCrop', (table) => {
    //   table.string('created_by_user_id').alter();
    //   table.string('updated_by_user_id').alter();
    // }),
  ]);
};
