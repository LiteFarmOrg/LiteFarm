/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20200505124117_update_insert_new_crops_into_crop_with_fc_variety.js) is part of LiteFarm.
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
    INSERT INTO "crop" (crop_common_name, crop_genus, crop_specie, crop_group, crop_subgroup, max_rooting_depth, depletion_fraction, initial_kc, is_avg_depth, mid_kc, end_kc, max_height, is_avg_kc, nutrient_notes, percentrefuse, refuse, protein, lipid, energy, ca, fe, mg, ph, k, na, zn, cu, fl, mn, se, vita_rae, vite, vitc, thiamin, riboflavin, niacin, pantothenic, vitb6, folate, vitb12, vitk, is_avg_nutrient, farm_id, user_added, deleted, nutrient_credits)
    SELECT REPLACE(crop_common_name, crop_common_name, CONCAT(crop_common_name, ' - ', fc.variety)), crop_genus, crop_specie, crop_group, crop_subgroup, max_rooting_depth, depletion_fraction, initial_kc, NULL, mid_kc, end_kc, max_height, NULL, nutrient_notes, percentrefuse, refuse, protein, lipid, energy, ca, fe, mg, ph, k, na, zn, cu, fl, mn, se, vita_rae, vite, vitc, thiamin, riboflavin, niacin, pantothenic, vitb6, folate, vitb12, vitk, NULL, f.farm_id, TRUE, deleted, nutrient_credits
    FROM "crop" c
    INNER JOIN "fieldCrop" fc on c.crop_id = fc.crop_id AND fc.variety!='' AND fc.variety IS NOT NULL
    INNER JOIN "field" f on f.field_id = fc.field_id
  `);

  await knex.raw(
    `
    CREATE MATERIALIZED VIEW update_field_crop_view AS
    SELECT c.crop_id, c.crop_common_name, fc.variety, fc.crop_id AS fc_old_crop_id, fc.field_crop_id, fc.field_id, f.farm_id
    FROM "crop" c
    INNER JOIN "field" f on f.farm_id = c.farm_id
    INNER JOIN "fieldCrop" fc on (fc.field_id = f.field_id)
    WHERE c.crop_common_name = CONCAT(
    (
    SELECT c2.crop_common_name
    FROM "crop" c2
    WHERE c2.crop_id=fc.crop_id
    ),
    ' - ',
    fc.variety
    )
    `
  );

  await knex.raw(
    `
    UPDATE "fieldCrop" fc
    SET crop_id = v.crop_id
    FROM "update_field_crop_view" v
    WHERE fc.field_crop_id = v.field_crop_id
    `
  );

  await knex.raw(
    `
    UPDATE "yield" y
    SET crop_id = v.crop_id
    FROM "update_field_crop_view" v
    WHERE y.crop_id = v.fc_old_crop_id AND y.farm_id = v.farm_id
    `
  );

  await knex.raw(
    `
    UPDATE "price" p
    SET crop_id = v.crop_id
    FROM "update_field_crop_view" v
    WHERE p.crop_id = v.fc_old_crop_id AND p.farm_id = v.farm_id
    `
  );

  await knex.raw(
    `
    UPDATE "waterBalance" w
    SET crop_id = v.crop_id
    FROM "update_field_crop_view" v
    WHERE w.crop_id = v.fc_old_crop_id AND w.field_id = v.field_id
    `
  );

  await knex.raw(
    `
    UPDATE "cropSale" cs
    SET crop_id = v.crop_id
    FROM "update_field_crop_view" v
    INNER JOIN "sale" s on s.farm_id = v.farm_id
    WHERE cs.crop_id = v.fc_old_crop_id AND s.sale_id = cs.sale_id
    `
  );

};

exports.down = function (knex, Promise) {

};