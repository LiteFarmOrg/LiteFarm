import { jsonArrayFrom } from 'kysely/helpers/postgres';
import db from '../db.js';
import { FarmId } from '../types.js';

export default {
  getFarmAnimals: (farmId: FarmId) =>
    db
      .selectFrom('animal')
      .selectAll('animal')
      .select((eb) => [
        jsonArrayFrom(
          eb
            .selectFrom('animal_union_batch_id_view as au')
            .selectAll('au')
            .whereRef('au.id', '=', 'animal.id')
            .where('au.batch', '=', false)
            .limit(1),
        ).as('internal_identifier'),
        jsonArrayFrom(
          eb
            .selectFrom('animal_use_relationship as aur')
            .selectAll('aur')
            .whereRef('aur.animal_id', '=', 'animal.id'),
        ).as('animal_use_relationships'),
        jsonArrayFrom(
          eb
            .selectFrom('animal_group_relationship as agr')
            .selectAll('agr')
            .whereRef('agr.animal_id', '=', 'animal.id'),
        ).as('group_ids'),
      ])
      .where('animal.farm_id', '=', farmId)
      .execute(),
};
