import { jsonArrayFrom } from 'kysely/helpers/postgres';
import db from '../db.js';
import { FarmId } from '../types.js';
import { CustomAnimalBreed, CustomAnimalType, DefaultAnimalBreed } from 'kysely-codegen';
import { Selectable } from 'kysely';

export default {
  getFarmAnimals(farmId: FarmId) {
    return db
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
      .execute();
  },

  getAnimalOtherUse() {
    return db
      .selectFrom('animal_use')
      .selectAll()
      .where('key', '=', 'OTHER')
      .executeTakeFirstOrThrow();
  },

  getCustomAnimalTypeById(id: Selectable<CustomAnimalType>['id']) {
    return db.selectFrom('custom_animal_type').selectAll().where('id', '=', id).executeTakeFirst();
  },

  getDefaultAnimalBreedById(id: Selectable<DefaultAnimalBreed>['id']) {
    return db
      .selectFrom('default_animal_breed')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  },

  getCustomAnimalBreedById(id: Selectable<CustomAnimalBreed>['id']) {
    return db
      .selectFrom('custom_animal_breed')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirstOrThrow();
  },

  getTypesByFarmAndTypes(farmId: FarmId, types: string[]) {
    if (!types.length) throw new Error('types array cannot be empty');
    return db
      .selectFrom('custom_animal_type')
      .selectAll()
      .where('farm_id', '=', farmId)
      .where('deleted', 'is', false)
      .where('type', 'in', types)
      .execute();
  },

  getBreedsByFarmAndTypeBreedPairs(
    farmId: FarmId,
    typeBreedPairs: Readonly<['custom_type_id' | 'default_type_id', number, string]>[],
  ) {
    if (!typeBreedPairs.length) throw new Error('typeBreedPairs array cannot be empty');
    return db
      .selectFrom('custom_animal_breed')
      .selectAll()
      .where('farm_id', '=', farmId)
      .where('deleted', 'is', false)
      .where((eb) =>
        eb.or(
          typeBreedPairs.map(([typeCol, typeId, breedName]) =>
            eb(typeCol, '=', typeId).and('breed', '=', breedName),
          ),
        ),
      )
      .execute();
  },
};
