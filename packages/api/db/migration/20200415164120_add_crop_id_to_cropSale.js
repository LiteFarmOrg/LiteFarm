/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20200415164120_add_crop_id_to_cropSale.js) is part of LiteFarm.
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

exports.up = async function (knex, Promise) {
  await knex.raw(`
  ALTER TABLE "cropSale"
  ADD COLUMN crop_id integer, ADD COLUMN farm_id uuid;
  `);

  await knex.raw(`
  ALTER TABLE "sale"
  ADD COLUMN farm_id uuid;
  `);

  await knex.raw(`
  ALTER TABLE "cropSale"
  ADD CONSTRAINT fk_crop_sale_crop_id FOREIGN KEY (crop_id) REFERENCES crop(crop_id);
  `);

  await knex.raw(`
  ALTER TABLE "sale"
  ADD CONSTRAINT fk_crop_sale_farm_id FOREIGN KEY (farm_id) REFERENCES farm(farm_id);
  `);

  await knex.raw(`UPDATE "cropSale" c
  SET crop_id = f.crop_id
  FROM "fieldCrop" f
  WHERE f.field_crop_id = c.field_crop_id;`);

  await knex.raw(`
  UPDATE "sale" s
SET farm_id = f.farm_id
FROM "fieldCrop" fc, "field" f, "cropSale" cs
WHERE fc.field_crop_id = cs.field_crop_id and f.field_id = fc.field_id and s.sale_id = cs.sale_id;
  `)



};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('cropSale', (table) => {
      table.dropColumn('crop_id');
    }),
    knex.schema.table('sale', (table) => {
      table.dropColumn('farm_id');
    }),
  ])
};
