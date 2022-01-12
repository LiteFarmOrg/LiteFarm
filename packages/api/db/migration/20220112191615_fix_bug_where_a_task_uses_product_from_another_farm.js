const { Model } = require('objection');
const TaskModel = require('../../src/models/taskModel');
exports.up = async function (knex) {
  Model.knex(knex);
  const graphTasks = await TaskModel.query().withGraphFetched(`
          [locations, managementPlans, soil_amendment_task, field_work_task, cleaning_task, pest_control_task, harvest_task.[harvest_use], plant_task, transplant_task]
        `);
  const getTaskFarmId = async (task) => {
    if (task.locations?.[0]?.farm_id) return task.locations?.[0]?.farm_id;
    else if (!task?.managementPlans?.length) return null;
    else {
      const [{ farm_id }] = await knex('crop_variety')
        .join('management_plan', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
        .where('management_plan.management_plan_id', task.managementPlans?.[0]?.management_plan_id);
      return farm_id;
    }
  };
  for (const task of graphTasks) {
    const product_id =
      task?.soil_amendment_task?.product_id ||
      task?.pest_control_task?.product_id ||
      task?.cleaning_task?.product_id;
    if (product_id) {
      const product = await knex('product').where({ product_id }).first();
      const farm_id = await getTaskFarmId(task);
      if (farm_id && product.farm_id && product.farm_id !== farm_id) {
        const [newProduct] = await knex('product')
          .insert({ ...product, farm_id, product_id: undefined })
          .returning('*');
        const task_id = task.task_id;
        await knex('soil_amendment_task')
          .where({ task_id })
          .update({ product_id: newProduct.product_id });
        await knex('pest_control_task')
          .where({ task_id })
          .update({ product_id: newProduct.product_id });
        await knex('cleaning_task')
          .where({ task_id })
          .update({ product_id: newProduct.product_id });
      }
    }
  }
};

exports.down = function (knex) {};
