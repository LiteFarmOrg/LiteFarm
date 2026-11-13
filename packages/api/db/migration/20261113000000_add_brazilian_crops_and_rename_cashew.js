/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
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

const getBucketName = () => {
  const environment = process.env.NODE_ENV || 'development';
  if (environment === 'production') {
    return 'litefarmapp';
  }
  if (environment === 'integration') {
    return 'litefarmbeta';
  }
  return 'litefarm';
};

const getCropPhotoUrl = (imageName) =>
  `https://${getBucketName()}.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/${imageName}`;

const catalogueCrops = (knex) => knex('crop').where({ reviewed: true }).whereNull('farm_id');

// HS codes: WCO HS Nomenclature 2022 edition, from
// https://www.wcoomd.org/en/topics/nomenclature/instrument-and-tools/hs-nomenclature-2022-edition/hs-nomenclature-2022-edition.aspx
const NEW_CROPS = [
  {
    crop_translation_key: 'CAMBUCI',
    crop_common_name: 'Cambuci',
    crop_genus: 'Campomanesia',
    crop_specie: 'phaea',
    crop_group: 'Fruit and nuts',
    crop_subgroup: 'Tropical and subtropical fruits',
    image_name: 'cambuci.webp',
    lifecycle: 'PERENNIAL',
    seeding_type: 'SEEDLING_OR_PLANTING_STOCK',
    needs_transplant: false,
    can_be_cover_crop: false,
    hs_code_id: 81090,
  },
  {
    crop_translation_key: 'PERSIAN_LIME',
    crop_common_name: 'Persian lime (Tahiti lime)',
    crop_genus: 'Citrus',
    crop_specie: 'latifolia',
    crop_group: 'Fruit and nuts',
    crop_subgroup: 'Citrus fruits',
    image_name: 'persian_lime.webp',
    lifecycle: 'PERENNIAL',
    seeding_type: 'SEEDLING_OR_PLANTING_STOCK',
    needs_transplant: false,
    can_be_cover_crop: false,
    hs_code_id: 80550,
  },
  {
    crop_translation_key: 'RANGPUR_LIME',
    crop_common_name: 'Rangpur lime',
    crop_genus: 'Citrus',
    crop_specie: 'limonia',
    crop_group: 'Fruit and nuts',
    crop_subgroup: 'Citrus fruits',
    image_name: 'rangpur_lime.webp',
    lifecycle: 'PERENNIAL',
    seeding_type: 'SEEDLING_OR_PLANTING_STOCK',
    needs_transplant: false,
    can_be_cover_crop: false,
    // 0805.50 names only C. aurantifolia and C. latifolia
    hs_code_id: 80590,
  },
  {
    crop_translation_key: 'COCONA',
    crop_common_name: 'Cocona',
    crop_genus: 'Solanum',
    crop_specie: 'sessiliflorum',
    crop_group: 'Fruit and nuts',
    crop_subgroup: 'Tropical and subtropical fruits',
    image_name: 'cocona.webp',
    lifecycle: 'PERENNIAL',
    seeding_type: 'SEED',
    needs_transplant: false,
    can_be_cover_crop: false,
    hs_code_id: 81090,
  },
  {
    crop_translation_key: 'WILD_LETTUCE',
    crop_common_name: 'Wild lettuce (Canada lettuce)',
    crop_genus: 'Lactuca',
    crop_specie: 'canadensis',
    crop_group: 'Vegetables and melons',
    crop_subgroup: 'Leafy or stem vegetables',
    image_name: 'wild_lettuce.webp',
    lifecycle: 'ANNUAL',
    seeding_type: 'SEEDLING_OR_PLANTING_STOCK',
    needs_transplant: true,
    can_be_cover_crop: false,
    // 0705 covers only Lactuca sativa
    hs_code_id: 70999,
  },
  {
    crop_translation_key: 'MALABAR_SPINACH',
    crop_common_name: 'Malabar spinach',
    crop_genus: 'Basella',
    crop_specie: 'alba',
    crop_group: 'Vegetables and melons',
    crop_subgroup: 'Leafy or stem vegetables',
    image_name: 'malabar_spinach.webp',
    lifecycle: 'PERENNIAL',
    seeding_type: 'SEEDLING_OR_PLANTING_STOCK',
    needs_transplant: true,
    can_be_cover_crop: true,
    // 0709.70 names only true, New Zealand and orache spinach
    hs_code_id: 70999,
  },
  {
    crop_translation_key: 'PARANA_PINE_NUT',
    crop_common_name: 'Paraná pine nut',
    crop_genus: 'Araucaria',
    crop_specie: 'angustifolia',
    crop_group: 'Fruit and nuts',
    crop_subgroup: 'Nuts',
    image_name: 'parana_pine_nut.webp',
    lifecycle: 'PERENNIAL',
    seeding_type: 'SEEDLING_OR_PLANTING_STOCK',
    needs_transplant: false,
    can_be_cover_crop: false,
    hs_code_id: 80291,
  },
  {
    crop_translation_key: 'GERMAN_CHAMOMILE',
    crop_common_name: 'German chamomile',
    crop_genus: 'Matricaria',
    crop_specie: 'chamomilla',
    crop_group: 'Other crops',
    crop_subgroup: 'Medicinal, pesticidal or similar crops',
    image_name: 'german_chamomile.webp',
    lifecycle: 'ANNUAL',
    seeding_type: 'SEED',
    needs_transplant: true,
    can_be_cover_crop: false,
    hs_code_id: 121190,
  },
  {
    crop_translation_key: 'GRUMIXAMA',
    crop_common_name: 'Grumixama (Brazil cherry)',
    crop_genus: 'Eugenia',
    crop_specie: 'brasiliensis',
    crop_group: 'Fruit and nuts',
    crop_subgroup: 'Tropical and subtropical fruits',
    image_name: 'grumixama.webp',
    lifecycle: 'PERENNIAL',
    seeding_type: 'SEEDLING_OR_PLANTING_STOCK',
    needs_transplant: false,
    can_be_cover_crop: false,
    hs_code_id: 81090,
  },
];

const CASHEW_BEFORE = {
  crop_translation_key: 'CASHEW_NUTS',
  crop_common_name: 'Cashew nuts',
  crop_photo_url: getCropPhotoUrl('cashew_nuts.webp'),
  hs_code_id: 8013,
};

const CASHEW_AFTER = {
  crop_translation_key: 'CASHEW',
  crop_common_name: 'Cashew',
  crop_photo_url: getCropPhotoUrl('cashew.webp'),
  // was 8013, cut short of the 6-digit subheading 0801.31 (cashew nuts, in shell)
  hs_code_id: 80131,
};

const LIME_BEFORE = {
  crop_common_name: 'Lime, sour',
  crop_photo_url: getCropPhotoUrl('lime.webp'),
};

const LIME_AFTER = {
  crop_common_name: 'Key lime (Mexican lime)',
  crop_photo_url: getCropPhotoUrl('key_lime.webp'),
};

const LIME_SWEET_BEFORE = { crop_common_name: 'Lime, sweet' };
const LIME_SWEET_AFTER = { crop_common_name: 'Sweet lime' };

export const up = async function (knex) {
  await knex('crop').insert(
    NEW_CROPS.map(({ image_name, ...crop }) => ({
      ...crop,
      crop_photo_url: getCropPhotoUrl(image_name),
      farm_id: null,
      reviewed: true,
    })),
  );

  await catalogueCrops(knex)
    .where({ crop_translation_key: CASHEW_BEFORE.crop_translation_key })
    .update(CASHEW_AFTER);

  await catalogueCrops(knex).where({ crop_translation_key: 'LIME' }).update(LIME_AFTER);

  await catalogueCrops(knex).where({ crop_translation_key: 'LIME_SWEET' }).update(LIME_SWEET_AFTER);
};

export const down = async function (knex) {
  await catalogueCrops(knex)
    .where({ crop_translation_key: 'LIME_SWEET' })
    .update(LIME_SWEET_BEFORE);

  await catalogueCrops(knex).where({ crop_translation_key: 'LIME' }).update(LIME_BEFORE);

  await catalogueCrops(knex)
    .where({ crop_translation_key: CASHEW_AFTER.crop_translation_key })
    .update(CASHEW_BEFORE);

  const insertedCropKeys = NEW_CROPS.map(({ crop_translation_key }) => crop_translation_key);

  await catalogueCrops(knex).whereIn('crop_translation_key', insertedCropKeys).delete();
};
