import {
  // eslint-disable-next-line no-unused-vars
  formatAlterTableEnumSql,
  dropTableEnumConstraintSql,
  addTableEnumConstraintSql,
} from '../util.js';

const upCropGroups = [
  'Fruit and nuts',
  'Other crops',
  'Stimulant, spice and aromatic crops',
  'Vegetables and melons',
  'Cereals',
  'High starch root/tuber crops',
  'Oilseed crops and oleaginous fruits',
  'Leguminous crops',
  'Sugar crops',
  'Potatoes and yams',
  'Beverage and spice crops',
];
const upCropSubgroup = [
  'Berries',
  'Cereals',
  'Citrus fruits',
  'Fibre crops',
  'Flower crops',
  'Fruit-bearing vegetables',
  'Grapes',
  'Grasses and other fodder crops',
  'High starch root/tuber crops',
  'Leafy or stem vegetables',
  'Leguminous crops',
  'Lentils',
  'Medicinal, pesticidal or similar crops',
  'Melons',
  'Mixed cereals',
  'Mushrooms and truffles',
  'Nuts',
  'Oilseed crops and oleaginous fruits',
  'Other crops',
  'Other fruits',
  'Other roots and tubers',
  'Other temporary oilseed crops',
  'Permanent oilseed crops',
  'Pome fruits and stone fruits',
  'Root, bulb or tuberous vegetables',
  'Rubber',
  'Spice and aromatic crops',
  'Stimulant crops',
  'Sugar crops',
  'Tobacco',
  'Tropical and subtropical fruits',
];

export const up = async function (knex) {
  await knex.raw(dropTableEnumConstraintSql('crop', 'crop_group'));
  await knex('crop')
    .where({ crop_group: 'Oilseed crops' })
    .update({ crop_group: 'Oilseed crops and oleaginous fruits' });
  await knex('crop')
    .where({ crop_group: 'High starch Root/tuber crops' })
    .update({ crop_group: 'High starch root/tuber crops' });
  await knex.raw(addTableEnumConstraintSql('crop', 'crop_group', upCropGroups));
  await knex.raw(dropTableEnumConstraintSql('crop', 'crop_subgroup'));
  await knex('crop')
    .where({ crop_subgroup: 'High starch Root/tuber crops' })
    .update({ crop_subgroup: 'High starch root/tuber crops' });
  await knex('crop')
    .where({ crop_subgroup: 'Legumes' })
    .update({ crop_subgroup: 'Leguminous crops' });
  await knex('crop')
    .where({ crop_subgroup: 'Medicinal, aromatic, pesticidal, or similar crops' })
    .update({ crop_subgroup: 'Medicinal, pesticidal or similar crops' });
  await knex('crop')
    .where({ crop_subgroup: 'Permanent spice crops' })
    .update({ crop_subgroup: 'Spice and aromatic crops' });
  await knex('crop')
    .where({ crop_subgroup: 'Temporary spice crops' })
    .update({ crop_subgroup: 'Spice and aromatic crops' });
  await knex('crop')
    .where({ crop_subgroup: 'Root, bulb, or tuberous vegetables' })
    .update({ crop_subgroup: 'Root, bulb or tuberous vegetables' });
  await knex('crop')
    .where({ crop_subgroup: 'Sugar crops (other)' })
    .update({ crop_subgroup: 'Sugar crops' });
  await knex('crop')
    .where({ crop_subgroup: 'Sugar crops (root)' })
    .update({ crop_subgroup: 'Sugar crops' });
  await knex('crop')
    .where({ crop_subgroup: 'Temporary oilseed crops' })
    .update({ crop_subgroup: 'Other temporary oilseed crops' });

  await knex.raw(addTableEnumConstraintSql('crop', 'crop_subgroup', upCropSubgroup));
  return Promise.all([
    knex.schema.alterTable('crop', (t) => {
      t.enu('lifecycle', ['ANNUAL', 'PERENNIAL']).notNullable().defaultTo('ANNUAL');
      t.enu('seeding_type', ['SEED', 'SEEDLING_OR_PLANTING_STOCK']).notNullable().defaultTo('SEED');
      t.boolean('needs_transplant').defaultTo(false);
      t.integer('germination_days').unsigned();
      t.integer('transplant_days').unsigned();
      t.integer('harvest_days').unsigned();
      t.integer('termination_days').unsigned();
      t.enu('planting_method', [
        'BROADCAST_METHOD',
        'CONTAINER_METHOD',
        'BED_METHOD',
        'ROW_METHOD',
      ]);
      t.decimal('plant_spacing', 36, 12);
      t.decimal('planting_depth', 36, 12).alter();
      t.decimal('seeding_rate', 36, 12);
    }),
    knex.schema.alterTable('crop_variety', (t) => {
      t.enu('planting_method', [
        'BROADCAST_METHOD',
        'CONTAINER_METHOD',
        'BED_METHOD',
        'ROW_METHOD',
      ]);
      t.decimal('plant_spacing', 36, 12);
      t.decimal('planting_depth', 36, 12).alter();
      t.boolean('needs_transplant').defaultTo(false);
      t.integer('germination_days').unsigned();
      t.integer('transplant_days').unsigned();
      t.integer('harvest_days').unsigned();
      t.integer('termination_days').unsigned();
      t.decimal('seeding_rate', 36, 12);
    }),
  ]);
};

const downCropGroups = [
  'Fruit and nuts',
  'Other crops',
  'Stimulant, spice and aromatic crops',
  'Vegetables and melons',
  'Cereals',
  'High starch root/tuber crops',
  'Oilseed crops',
  'Leguminous crops',
  'Sugar crops',
  'Potatoes and yams',
  'High starch Root/tuber crops',
  'Beverage and spice crops',
];
const downCropSubgroups = [
  'Berries',
  'Cereals',
  'Citrus fruits',
  'Fibre crops',
  'Flower crops',
  'Fruit-bearing vegetables',
  'Grapes',
  'Grasses and other fodder crops',
  'High starch Root/tuber crops',
  'Leafy or stem vegetables',
  'Legumes',
  'Lentils',
  'Medicinal, aromatic, pesticidal, or similar crops',
  'Melons',
  'Mixed cereals',
  'Mushrooms and truffles',
  'Nuts',
  'Oilseed crops and oleaginous fruits',
  'Other crops',
  'Other fruits',
  'Other roots and tubers',
  'Permanent oilseed crops',
  'Pome fruits and stone fruits',
  'Root, bulb, or tuberous vegetables',
  'Rubber',
  'Spice and aromatic crops',
  'Stimulant crops',
  'Sugar crops',
  'Temporary oilseed crops',
  'Tobacco',
  'Tropical and subtropical fruits',
];

export const down = async function (knex) {
  await knex.raw(dropTableEnumConstraintSql('crop', 'crop_group'));
  await knex('crop')
    .where({ crop_group: 'Oilseed crops and oleaginous fruits' })
    .update({ crop_group: 'Oilseed crops' });
  await knex('crop')
    .where({ crop_group: 'High starch root/tuber crops' })
    .update({ crop_group: 'High starch Root/tuber crops' });
  await knex.raw(addTableEnumConstraintSql('crop', 'crop_group', downCropGroups));
  await knex.raw(dropTableEnumConstraintSql('crop', 'crop_subgroup'));
  await knex('crop')
    .where({ crop_subgroup: 'High starch root/tuber crops' })
    .update({ crop_subgroup: 'High starch Root/tuber crops' });
  await knex('crop')
    .where({ crop_subgroup: 'Leguminous crops' })
    .update({ crop_subgroup: 'Legumes' });
  await knex('crop')
    .where({ crop_subgroup: 'Medicinal, pesticidal or similar crops' })
    .update({ crop_subgroup: 'Medicinal, aromatic, pesticidal, or similar crops' });
  await knex('crop')
    .where({ crop_subgroup: 'Root, bulb or tuberous vegetables' })
    .update({ crop_subgroup: 'Root, bulb, or tuberous vegetables' });
  await knex('crop')
    .where({ crop_subgroup: 'Other temporary oilseed crops' })
    .update({ crop_subgroup: 'Temporary oilseed crops' });

  await knex.raw(addTableEnumConstraintSql('crop', 'crop_subgroup', downCropSubgroups));
  return Promise.all([
    knex.schema.alterTable('crop', (t) => {
      t.dropColumn('lifecycle');
      t.dropColumn('seeding_type');
      t.dropColumn('needs_transplant');
      t.dropColumn('germination_days');
      t.dropColumn('transplant_days');
      t.dropColumn('harvest_days');
      t.dropColumn('termination_days');
      t.dropColumn('planting_method');
      t.dropColumn('plant_spacing');
      t.integer('planting_depth').alter();
      t.dropColumn('seeding_rate');
    }),
    knex.schema.alterTable('crop_variety', (t) => {
      t.dropColumn('planting_method');
      t.dropColumn('plant_spacing');
      t.integer('planting_depth').alter();
      t.dropColumn('needs_transplant');
      t.dropColumn('germination_days');
      t.dropColumn('transplant_days');
      t.dropColumn('harvest_days');
      t.dropColumn('termination_days');
      t.dropColumn('seeding_rate');
    }),
  ]);
};
