export const up = async function (knex) {
  // remove duplicate items
  const duplicateItems = await knex.raw(`
    select sale_id, crop_id
      from "cropSale" group by sale_id, crop_id
      HAVING COUNT(sale_id) > 1
  `);
  await Promise.all(
    duplicateItems.rows.map(async (dupItemRow) => {
      const { sale_id, crop_id } = dupItemRow;
      const [deletedItem] = await knex('cropSale')
        .where({ sale_id, crop_id })
        .delete()
        .returning('*');
      await knex('cropSale').insert(deletedItem);
    }),
  );

  // transition crop_id reference to be crop_variety_id
  await knex.schema.alterTable('cropSale', (t) => {
    t.uuid('crop_variety_id');
  });
  const cropSales = await knex.raw(`
    select "cropSale".sale_id, "cropSale".crop_id, crop_variety.crop_variety_id
      from "cropSale"
      join sale on "cropSale".sale_id = sale.sale_id
      left join crop_variety on "cropSale".crop_id = crop_variety.crop_id and sale.farm_id = crop_variety.farm_id
  `);
  await Promise.all(
    cropSales.rows.map((cropSaleRow) => {
      const { sale_id, crop_id, crop_variety_id } = cropSaleRow;
      return knex('cropSale').where({ sale_id, crop_id }).update({ crop_variety_id });
    }),
  );

  await knex.schema.raw(`
    ALTER TABLE "cropSale"
    DROP CONSTRAINT "cropsale_sale_id_foreign";
    ALTER TABLE "cropSale"
    DROP CONSTRAINT "fk_crop_sale_crop_id";
  `),
    await knex.schema.renameTable('cropSale', 'crop_variety_sale');

  await knex.schema.alterTable('crop_variety_sale', (t) => {
    t.dropColumn('crop_id');
    t.integer('sale_id').references('sale_id').inTable('sale').alter();
    t.uuid('crop_variety_id').references('crop_variety_id').inTable('crop_variety').alter();
    t.primary(['sale_id', 'crop_variety_id']);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('crop_variety_sale', (t) => {
    t.integer('crop_id');
  });
  const cropSales = await knex.raw(`
    select "crop_variety_sale".sale_id, "crop_variety_sale".crop_variety_id, crop_variety.crop_id
      from "crop_variety_sale"
      join crop_variety on "crop_variety_sale".crop_variety_id = crop_variety.crop_variety_id
  `);
  await Promise.all(
    cropSales.rows.map((cropSaleRow) => {
      const { sale_id, crop_id, crop_variety_id } = cropSaleRow;
      return knex('crop_variety_sale').where({ sale_id, crop_variety_id }).update({ crop_id });
    }),
  );

  await knex.schema.alterTable('crop_variety_sale', (t) => {
    t.dropPrimary();
  });

  await knex.schema.renameTable('crop_variety_sale', 'cropSale');

  await knex.raw(`
    ALTER TABLE "cropSale"
    DROP CONSTRAINT "crop_variety_sale_sale_id_foreign";
    ALTER TABLE "cropSale"
    DROP CONSTRAINT "crop_variety_sale_crop_variety_id_foreign";
    ALTER TABLE "cropSale"
    ADD CONSTRAINT fk_crop_sale_crop_id FOREIGN KEY (crop_id) REFERENCES crop(crop_id);
  `);

  await knex.schema.alterTable('cropSale', (t) => {
    t.dropColumn('crop_variety_id');
    t.integer('sale_id').references('sale_id').inTable('sale').onDelete('CASCADE').alter();
  });
};
