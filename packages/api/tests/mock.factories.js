import { faker } from '@faker-js/faker';
import knex from '../src/util/knex';

function weather_stationFactory(station = fakeStation()) {
  return knex('weather_station').insert(station).returning('*');
}

function fakeStation(defaultData = {}) {
  return {
    id: faker.datatype.number(0x7fffffff),
    name: faker.address.country(),
    country: faker.address.countryCode(),
    timezone: faker.datatype.number(1000),
    ...defaultData,
  };
}

function usersFactory(userObject = fakeUser()) {
  return knex('users').insert(userObject).returning('*');
}

function fakeUser(defaultData = {}) {
  const email = faker.lorem.word() + faker.internet.email();
  return {
    first_name: faker.name.findName(),
    last_name: faker.name.lastName(),
    email: email.toLowerCase(),
    user_id: faker.datatype.uuid(),
    status_id: 1,
    phone_number: faker.phone.phoneNumber(),
    gender: faker.helpers.arrayElement(['OTHER', 'PREFER_NOT_TO_SAY', 'MALE', 'FEMALE']),
    birth_year: faker.datatype.number({ min: 1900, max: new Date().getFullYear() }),
    do_not_email: false,
    ...defaultData,
  };
}

function fakeSSOUser(defaultData = {}) {
  const email = faker.lorem.word() + faker.internet.email();
  return {
    first_name: faker.name.findName(),
    last_name: faker.name.lastName(),
    email: email.toLowerCase(),
    user_id: faker.datatype.number({ min: 2, max: 10 }),
    phone_number: faker.phone.phoneNumber(),
    ...defaultData,
  };
}

async function farmFactory(farmObject = fakeFarm()) {
  const [{ user_id }] = await usersFactory();
  const base = baseProperties(user_id);
  return knex('farm')
    .insert({ ...farmObject, ...base })
    .returning('*');
}

function fakeFarm(defaultData = {}) {
  return {
    farm_name: faker.company.companyName(),
    address: faker.address.streetAddress(),
    grid_points: {
      lat: faker.address.latitude(),
      lng: faker.address.longitude(),
    },
    farm_phone_number: faker.phone.phoneNumber(),
    ...defaultData,
  };
}

async function userFarmFactory(
  { promisedUser = usersFactory(), promisedFarm = farmFactory(), roleId } = {},
  userFarm = fakeUserFarm(),
) {
  const [user, farm] = await Promise.all([promisedUser, promisedFarm]);
  const [{ user_id }] = user;
  const [{ farm_id }] = farm;
  return knex('userFarm')
    .insert({
      user_id,
      farm_id,
      has_consent: true,
      ...userFarm,
      role_id: roleId || userFarm.role_id,
    })
    .returning('*');
}

function fakeUserFarm(defaultData = {}) {
  return {
    role_id: faker.helpers.arrayElement([1, 2, 3, 5]),
    status: 'Active',
    has_consent: true,
    step_one: false,
    wage: { type: 'hourly', amount: faker.datatype.number(300) },
    ...defaultData,
  };
}

async function farmDataScheduleFactory(
  { promisedUser = usersFactory(), promisedFarm = farmFactory() } = {},
  farmDataSchedule = fakeFarmDataSchedule(),
) {
  const [user, farm] = await Promise.all([promisedUser, promisedFarm]);
  const [{ user_id }] = user;
  const [{ farm_id }] = farm;
  return knex('farmDataSchedule')
    .insert({ user_id, farm_id, ...farmDataSchedule })
    .returning('*');
}

function fakeFarmDataSchedule(defaultData = {}) {
  return {
    has_failed: false,
    ...defaultData,
  };
}

async function locationFactory({ promisedFarm = farmFactory() } = {}, location = fakeLocation()) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('location')
    .insert({ farm_id, ...base, ...location })
    .returning('*');
}

function fakeLocation(defaultData = {}) {
  return {
    name: faker.helpers.arrayElement(['Location1', 'Nice Location', 'Fence', 'AreaLocation']),
    notes: faker.lorem.word(3),
    ...defaultData,
  };
}

async function areaFactory(
  { promisedFarm = farmFactory(), promisedLocation = locationFactory({ promisedFarm }) } = {},
  area = fakeArea(),
  areaType,
) {
  const [location] = await Promise.all([promisedLocation]);
  const [{ location_id }] = location;
  const { type, ...realArea } = area;
  const [{ figure_id }] = await figureFactory(location_id, areaType ? areaType : type);
  return knex('area')
    .insert({ figure_id, ...realArea })
    .returning('*');
}

function figureFactory(location_id, type) {
  return knex('figure').insert({ location_id, type }).returning('*');
}

function fakeArea(stringify = true, defaultData = {}) {
  return {
    total_area: faker.datatype.number(2000),
    grid_points: stringify
      ? JSON.stringify([
          ...Array(3).map(() => ({
            lat: faker.address.latitude(),
            lng: faker.address.longitude(),
          })),
        ])
      : [
          ...Array(3).map(() => ({
            lat: faker.address.latitude(),
            lng: faker.address.longitude(),
          })),
        ],
    perimeter: faker.datatype.number(),
    total_area_unit: faker.helpers.arrayElement(['m2', 'ha', 'ft2', 'ac']),
    perimeter_unit: faker.helpers.arrayElement(['m', 'km', 'ft', 'mi']),
    ...defaultData,
  };
}

async function fieldFactory(
  {
    promisedStation = weather_stationFactory(),
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedArea = areaFactory({ promisedLocation }, fakeArea(), 'field'),
  } = {},
  field = fakeField(),
) {
  const [station, location] = await Promise.all([promisedStation, promisedLocation, promisedArea]);
  const [{ station_id }] = station;
  const [{ location_id }] = location;
  return knex('field')
    .insert({ location_id, station_id, ...field })
    .returning('*');
}

function fakeField(defaultData = {}) {
  return {
    organic_status: faker.helpers.arrayElement(['Non-Organic', 'Transitional', 'Organic']),
    transition_date: faker.date.future().toISOString().split('T')[0],
    ...defaultData,
  };
}

async function organic_historyFactory(
  {
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedArea = areaFactory({ promisedLocation }, fakeArea(), 'field'),
    promisedField = fieldFactory({ promisedFarm, promisedLocation, promisedArea }),
  } = {},
  organicHistory = fakeOrganicHistory(),
) {
  const [field, user] = await Promise.all([promisedField, usersFactory()]);
  const [{ location_id }] = field;
  const [{ user_id }] = user;
  return knex('organic_history')
    .insert({ location_id, ...organicHistory, ...baseProperties(user_id) })
    .returning('*');
}

function fakeOrganicHistory(defaultData = {}) {
  return {
    organic_status: faker.helpers.arrayElement(['Non-Organic', 'Transitional', 'Organic']),
    effective_date: faker.date.past().toISOString().split('T')[0],
    ...defaultData,
  };
}

async function gardenFactory(
  {
    promisedStation = weather_stationFactory(),
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedArea = areaFactory({ promisedLocation }, fakeArea(), 'garden'),
  } = {},
  garden = fakeGarden(),
) {
  const [station, location] = await Promise.all([promisedStation, promisedLocation, promisedArea]);
  const [{ station_id }] = station;
  const [{ location_id }] = location;
  return knex('garden')
    .insert({ location_id, station_id, ...garden })
    .returning('*');
}

function fakeGarden(defaultData = {}) {
  return {
    organic_status: faker.helpers.arrayElement(['Non-Organic', 'Transitional', 'Organic']),
    transition_date: faker.date.future().toISOString().split('T')[0],
    ...defaultData,
  };
}

function fakeFieldForTests(defaultData = {}) {
  return {
    ...fakeField(),
    grid_points: [
      {
        lat: faker.address.latitude(),
        lng: faker.address.longitude(),
      },
    ],
    ...defaultData,
  };
}

function fakePriceInsightForTests(defaultData = {}) {
  return {
    distance: faker.helpers.arrayElement([5, 10, 25, 50]),
    lat: faker.address.latitude(),
    long: faker.address.latitude(),
    startdate: '2021-10-10',
    ...defaultData,
  };
}

async function lineFactory(
  { promisedFarm = farmFactory(), promisedLocation = locationFactory({ promisedFarm }) } = {},
  line = fakeLine(),
  lineType,
) {
  const [location] = await Promise.all([promisedLocation]);
  const [{ location_id }] = location;
  const { type, ...realLine } = line;
  const [{ figure_id }] = await figureFactory(location_id, lineType ? lineType : type);
  return knex('line')
    .insert({ figure_id, ...realLine })
    .returning('*');
}

function fakeLine(stringify = true, defaultData = {}) {
  return {
    length: faker.datatype.number(),
    width: faker.datatype.number(),
    line_points: stringify
      ? JSON.stringify([
          ...Array(2).map(() => ({
            lat: faker.address.latitude(),
            lng: faker.address.longitude(),
          })),
        ])
      : [
          ...Array(2).map(() => ({
            lat: faker.address.latitude(),
            lng: faker.address.longitude(),
          })),
        ],
    ...defaultData,
  };
}

async function fenceFactory(
  { promisedFarm = farmFactory(), promisedLocation = locationFactory({ promisedFarm }) } = {},
  fence = fakeFence(),
) {
  const [location] = await Promise.all([promisedLocation]);
  const [{ location_id }] = location;
  await lineFactory({ promisedLocation: location }, fakeLine(), 'fence');
  return knex('fence')
    .insert({ location_id, ...fence })
    .returning('*');
}

function fakeFence(defaultData = {}) {
  return {
    pressure_treated: faker.datatype.boolean(),
    ...defaultData,
  };
}

async function cropFactory(
  { promisedFarm = farmFactory(), createdUser = usersFactory() } = {},
  crop = fakeCrop(),
) {
  const [farm, user] = await Promise.all([promisedFarm, createdUser]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('crop')
    .insert({ farm_id, ...crop, ...base })
    .returning('*');
}

async function yieldFactory({ promisedCrop = cropFactory() } = {}, yield1 = fakeYield()) {
  const [crop] = await Promise.all([promisedCrop]);
  const [{ crop_id }] = crop;
  const [{ farm_id }] = crop;
  return knex('yield')
    .insert({ crop_id, farm_id, ...yield1 })
    .returning('*');
}

async function priceFactory({ promisedCrop = cropFactory() } = {}, price = fakePrice()) {
  const [crop] = await Promise.all([promisedCrop]);
  const [{ crop_id }] = crop;
  const [{ farm_id }] = crop;
  return knex('price')
    .insert({ crop_id, farm_id, ...price })
    .returning('*');
}

async function farmExpenseTypeFactory(
  { promisedFarm = farmFactory() } = {},
  expense_type = fakeExpenseType(),
) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('farmExpenseType')
    .insert({ farm_id, ...expense_type, ...base })
    .returning('*');
}

async function farmExpenseFactory(
  { promisedExpenseType = farmExpenseTypeFactory(), promisedUserFarm = userFarmFactory() } = {},
  expense = fakeExpense(),
) {
  const [expense_type, user] = await Promise.all([promisedExpenseType, promisedUserFarm]);
  const [{ expense_type_id }] = expense_type;
  const [{ user_id }] = user;
  const [{ farm_id }] = expense_type;
  const base = baseProperties(user_id);
  return knex('farmExpense')
    .insert({ expense_type_id, farm_id, ...expense, ...base })
    .returning('*');
}

function fakeCrop(defaultData = {}) {
  return {
    crop_common_name: faker.lorem.words(),
    crop_translation_key: faker.lorem.words(),
    crop_genus: faker.lorem.words(),
    crop_specie: faker.lorem.words(),
    crop_group: faker.helpers.arrayElement([
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
    ]),
    crop_subgroup: faker.helpers.arrayElement([
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
    ]),
    max_rooting_depth: faker.datatype.number(10),
    depletion_fraction: faker.datatype.number(10),
    is_avg_depth: faker.datatype.boolean(),
    initial_kc: faker.datatype.number(10),
    mid_kc: faker.datatype.number(10),
    end_kc: faker.datatype.number(10),
    max_height: faker.datatype.number(10),
    is_avg_kc: faker.datatype.boolean(),
    nutrient_notes: faker.lorem.words(),
    percentrefuse: faker.datatype.number(10),
    refuse: faker.lorem.words(),
    protein: faker.datatype.number(10),
    lipid: faker.datatype.number(10),
    energy: faker.datatype.number(10),
    ca: faker.datatype.number(10),
    fe: faker.datatype.number(10),
    mg: faker.datatype.number(10),
    ph: faker.datatype.number(10),
    k: faker.datatype.number(10),
    na: faker.datatype.number(10),
    zn: faker.datatype.number(10),
    cu: faker.datatype.number(10),
    fl: faker.datatype.number(10),
    mn: faker.datatype.number(10),
    se: faker.datatype.number(10),
    vita_rae: faker.datatype.number(10),
    vite: faker.datatype.number(10),
    vitc: faker.datatype.number(10),
    thiamin: faker.datatype.number(10),
    riboflavin: faker.datatype.number(10),
    niacin: faker.datatype.number(10),
    pantothenic: faker.datatype.number(10),
    vitb6: faker.datatype.number(10),
    folate: faker.datatype.number(10),
    vitb12: faker.datatype.number(10),
    vitk: faker.datatype.number(10),
    is_avg_nutrient: faker.datatype.boolean(),
    user_added: faker.datatype.boolean(),
    deleted: false,
    nutrient_credits: faker.datatype.number(10),
    crop_photo_url: faker.internet.url(),
    can_be_cover_crop: faker.datatype.boolean(),
    planting_depth: faker.datatype.number(10),
    yield_per_area: faker.datatype.number(10),
    average_seed_weight: faker.datatype.number(10),
    yield_per_plant: faker.datatype.number(10),
    seeding_type: faker.helpers.arrayElement(['SEED', 'SEEDLING_OR_PLANTING_STOCK']),
    lifecycle: faker.helpers.arrayElement(['ANNUAL', 'PERENNIAL']),
    needs_transplant: faker.datatype.boolean(),
    germination_days: faker.datatype.number({ min: 1, max: 10 }),
    transplant_days: faker.datatype.number({ min: 11, max: 20 }),
    harvest_days: faker.datatype.number({ min: 21, max: 30 }),
    termination_days: faker.datatype.number({ min: 31, max: 40 }),
    planting_method: faker.helpers.arrayElement([
      'BROADCAST_METHOD',
      'CONTAINER_METHOD',
      'BED_METHOD',
      'ROW_METHOD',
    ]),
    plant_spacing: faker.datatype.number(100),
    seeding_rate: faker.datatype.number(10000),
    ...defaultData,
  };
}

function fakeYield(defaultData = {}) {
  return {
    yield_id: faker.datatype.number(0x7fffffff),
    'quantity_kg/m2': faker.datatype.number(10),
    date: faker.date.future(),
    ...defaultData,
  };
}

function fakePrice(defaultData = {}) {
  return {
    price_id: faker.datatype.number(0x7fffffff),
    'value_$/kg': faker.datatype.number(100),
    date: faker.date.future(),
    ...defaultData,
  };
}

function fakeExpense(defaultData = {}) {
  return {
    expense_date: faker.date.future(),
    value: faker.datatype.number(100),
    note: faker.helpers.randomize(),
    ...defaultData,
  };
}

async function management_planFactory(
  {
    promisedFarm = farmFactory(),
    promisedCrop = cropFactory({ promisedFarm }),
    promisedCropVariety = crop_varietyFactory({ promisedCrop, promisedFarm }),
  } = {},
  managementPlan = fakeManagementPlan(),
) {
  const [cropVariety] = await Promise.all([promisedCropVariety]);
  const [{ crop_variety_id, created_by_user_id }] = cropVariety;
  const base = baseProperties(created_by_user_id);
  return knex('management_plan')
    .insert({
      crop_variety_id,
      ...managementPlan,
      ...base,
    })
    .returning('*');
}

function fakeManagementPlan(defaultData = {}) {
  // seed date always in past, harvest date always in future - management plan is in progress
  return {
    name: faker.lorem.words(),
    notes: faker.lorem.words(),
    start_date: faker.date.past().toISOString().split('T')[0],
    ...defaultData,
  };
}

async function crop_management_planFactory(
  {
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedField = fieldFactory({ promisedFarm, promisedLocation }),
    promisedCrop = cropFactory({ promisedFarm }),
    promisedCropVariety = crop_varietyFactory({ promisedCrop, promisedFarm }),
    promisedManagementPlan = management_planFactory({
      promisedFarm,
      promisedLocation,
      promisedField,
      promisedCropVariety,
      promisedCrop,
    }),
  } = {},
  {
    cropManagementPlan = fakeCropManagementPlan(),
    plantingManagementPlans = [
      {
        planting_management_plan: fakePlantingManagementPlan({
          is_final_planting_management_plan: true,
        }),
        row_method: fakeRowMethod(),
        container_method: fakeContainerMethod(),
        bed_method: fakeBedMethod(),
        broadcast_method: fakeBroadcastMethod(),
      },
      {
        planting_management_plan: fakePlantingManagementPlan({
          is_final_planting_management_plan: false,
        }),
        row_method: fakeRowMethod(),
        container_method: fakeContainerMethod(),
        bed_method: fakeBedMethod(),
        broadcast_method: fakeBroadcastMethod(),
      },
    ],
  } = {},
) {
  const [[{ location_id }], managementPlan] = await Promise.all([
    promisedField,
    promisedManagementPlan,
  ]);
  const [{ management_plan_id }] = managementPlan;
  const { needs_transplant } = cropManagementPlan;
  needs_transplant &&
    (await insertPlantingMethod({
      ...plantingManagementPlans[1],
      planting_management_plan: {
        ...plantingManagementPlans[1].planting_management_plan,
        management_plan_id,
        location_id,
      },
    }));
  await insertPlantingMethod({
    ...plantingManagementPlans[0],
    planting_management_plan: {
      ...plantingManagementPlans[0].planting_management_plan,
      management_plan_id,
      location_id,
    },
  });
  return knex('crop_management_plan')
    .insert({
      management_plan_id,
      ...cropManagementPlan,
    })
    .returning('*');
}

async function insertPlantingMethod(
  plantingMethod = {
    planting_management_plan: {},
    row_method: {},
    container_method: {},
    bed_method: {},
    broadcast_method: {},
  },
) {
  const [{ planting_management_plan_id }] = await knex('planting_management_plan')
    .insert(plantingMethod.planting_management_plan)
    .returning('*');
  const planting_method = plantingMethod.planting_management_plan.planting_method.toLowerCase();
  await knex(planting_method).insert({
    ...plantingMethod[planting_method],
    planting_management_plan_id,
  });
}

function fakeCropManagementPlan(defaultData = {}) {
  return {
    estimated_revenue: faker.datatype.number(10000),
    estimated_yield: faker.datatype.number(10000),
    estimated_price_per_mass: faker.datatype.number(10000),
    seed_date: faker.date.past().toISOString().split('T')[0],
    plant_date: faker.date.past().toISOString().split('T')[0],
    germination_date: faker.date.past().toISOString().split('T')[0],
    transplant_date: faker.date.past().toISOString().split('T')[0],
    harvest_date: faker.date.future().toISOString().split('T')[0],
    termination_date: faker.date.future().toISOString().split('T')[0],
    already_in_ground: faker.datatype.boolean(),
    is_seed: faker.datatype.boolean(),
    needs_transplant: faker.datatype.boolean(),
    for_cover: faker.datatype.boolean(),
    is_wild: faker.datatype.boolean(),
    ...defaultData,
  };
}

async function planting_management_planFactory(
  {
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedField = fieldFactory({ promisedFarm, promisedLocation }),
    promisedCrop = cropFactory({ promisedFarm }),
    promisedCropVariety = crop_varietyFactory({ promisedFarm, promisedCrop }),
    promisedManagementPlan = management_planFactory({
      promisedFarm,
      promisedLocation,
      promisedField,
      promisedCropVariety,
      promisedCrop,
    }),
  } = {},
  {
    planting_management_plan = fakePlantingManagementPlan(),
    row_method = planting_management_plan.planting_method.toLowerCase() === 'row_method'
      ? fakeRowMethod()
      : undefined,
    container_method = planting_management_plan.planting_method.toLowerCase() === 'container_method'
      ? fakeContainerMethod()
      : undefined,
    bed_method = planting_management_plan.planting_method.toLowerCase() === 'bed_method'
      ? fakeBedMethod()
      : undefined,
    broadcast_method = planting_management_plan.planting_method.toLowerCase() === 'broadcast_method'
      ? fakeBroadcastMethod()
      : undefined,
  } = {},
) {
  const [{ management_plan_id }] = await crop_management_planFactory(
    {
      promisedFarm,
      promisedLocation,
      promisedField,
      promisedCropVariety,
      promisedCrop,
      promisedManagementPlan,
    },
    {
      cropManagementPlan: { ...fakeCropManagementPlan(), needs_transplant: false },
      plantingManagementPlans: [
        {
          planting_management_plan: {
            ...planting_management_plan,
            is_final_planting_management_plan: true,
          },
          row_method,
          bed_method,
          container_method,
          broadcast_method,
        },
      ],
    },
  );
  return knex('planting_management_plan').where({
    management_plan_id,
    is_final_planting_management_plan: true,
  });
}

function fakePlantingManagementPlan(defaultData = {}) {
  return {
    is_final_planting_management_plan: faker.datatype.boolean(),
    planting_method: faker.helpers.arrayElement([
      'BROADCAST_METHOD',
      'CONTAINER_METHOD',
      'BED_METHOD',
      'ROW_METHOD',
    ]),
    is_planting_method_known: true,
    estimated_seeds: faker.datatype.number(10000),
    notes: faker.lorem.words(),
    ...defaultData,
  };
}

async function container_methodFactory(
  {
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedField = fieldFactory({ promisedFarm, promisedLocation }),
    promisedCrop = cropFactory({ promisedFarm }),
    promisedCropVariety = crop_varietyFactory({ promisedCrop }),
    promisedManagementPlan = management_planFactory({
      promisedFarm,
      promisedLocation,
      promisedField,
      promisedCropVariety,
      promisedCrop,
    }),
  } = {},
  {
    planting_management_plan = fakePlantingManagementPlan({ planting_method: 'CONTAINER_METHOD' }),
    container_method = fakeContainerMethod(),
  } = {},
) {
  const [{ management_plan_id }] = await crop_management_planFactory(
    {
      promisedFarm,
      promisedLocation,
      promisedField,
      promisedCropVariety,
      promisedCrop,
      promisedManagementPlan,
    },
    {
      cropManagementPlan: { ...fakeCropManagementPlan(), needs_transplant: false },
      plantingManagementPlans: [
        {
          planting_management_plan: {
            ...planting_management_plan,
            is_final_planting_management_plan: true,
          },
          container_method,
        },
      ],
    },
  );
  const { planting_management_plan_id } = await knex('planting_management_plan')
    .where({
      management_plan_id,
      is_final_planting_management_plan: true,
    })
    .first();
  return knex('container_method').where({ planting_management_plan_id });
}

function fakeContainerMethod(defaultData = {}) {
  const in_ground = faker.datatype.boolean();
  return {
    in_ground,
    plant_spacing: in_ground ? null : faker.datatype.number(100),
    total_plants: in_ground ? faker.datatype.number(100) : null,
    number_of_containers: in_ground ? null : faker.datatype.number(100),
    plants_per_container: in_ground ? null : faker.datatype.number(100),
    planting_depth: faker.datatype.number(100),
    planting_soil: in_ground ? null : faker.random.words(),
    container_type: in_ground ? null : faker.random.words(),
    ...defaultData,
  };
}

async function broadcast_methodFactory(
  {
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedField = fieldFactory({ promisedFarm, promisedLocation }),
    promisedCrop = cropFactory({ promisedFarm }),
    promisedCropVariety = crop_varietyFactory({ promisedCrop }),
    promisedManagementPlan = management_planFactory({
      promisedFarm,
      promisedLocation,
      promisedField,
      promisedCropVariety,
      promisedCrop,
    }),
  } = {},
  {
    planting_management_plan = fakePlantingManagementPlan({ planting_method: 'BROADCAST_METHOD' }),
    broadcast_method = fakeBroadcastMethod(),
  } = {},
) {
  const [{ management_plan_id }] = await crop_management_planFactory(
    {
      promisedFarm,
      promisedLocation,
      promisedField,
      promisedCropVariety,
      promisedCrop,
      promisedManagementPlan,
    },
    {
      cropManagementPlan: { ...fakeCropManagementPlan(), needs_transplant: false },
      plantingManagementPlans: [
        {
          planting_management_plan: {
            ...planting_management_plan,
            is_final_planting_management_plan: true,
          },
          broadcast_method,
        },
      ],
    },
  );
  const { planting_management_plan_id } = await knex('planting_management_plan')
    .where({
      management_plan_id,
      is_final_planting_management_plan: true,
    })
    .first();
  return knex('broadcast_method').where({ planting_management_plan_id });
}

function fakeBroadcastMethod(defaultData = {}) {
  return {
    percentage_planted: faker.datatype.number(10),
    area_used: faker.datatype.number(10000),
    seeding_rate: faker.datatype.number(10000),
    ...defaultData,
  };
}

async function row_methodFactory(
  {
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedField = fieldFactory({ promisedFarm, promisedLocation }),
    promisedCrop = cropFactory({ promisedFarm }),
    promisedCropVariety = crop_varietyFactory({ promisedCrop }),
    promisedManagementPlan = management_planFactory({
      promisedFarm,
      promisedLocation,
      promisedField,
      promisedCropVariety,
      promisedCrop,
    }),
  } = {},
  {
    planting_management_plan = fakePlantingManagementPlan({ planting_method: 'ROW_METHOD' }),
    row_method = fakeRowMethod(),
  } = {},
) {
  const [{ management_plan_id }] = await crop_management_planFactory(
    {
      promisedFarm,
      promisedLocation,
      promisedField,
      promisedCropVariety,
      promisedCrop,
      promisedManagementPlan,
    },
    {
      cropManagementPlan: { ...fakeCropManagementPlan(), needs_transplant: false },
      plantingManagementPlans: [
        {
          planting_management_plan: {
            ...planting_management_plan,
            is_final_planting_management_plan: true,
          },
          row_method,
        },
      ],
    },
  );
  const { planting_management_plan_id } = await knex('planting_management_plan')
    .where({
      management_plan_id,
      is_final_planting_management_plan: true,
    })
    .first();
  return knex('row_method').where({ planting_management_plan_id });
}

function fakeRowMethod(defaultData = {}) {
  const same_length = faker.datatype.boolean();
  return {
    same_length,
    number_of_rows: same_length ? faker.datatype.number(999) : null,
    row_length: same_length ? faker.datatype.number(10000) : null,
    plant_spacing: faker.datatype.number(10000),
    total_rows_length: same_length ? null : faker.datatype.number(10000),
    specify_rows: faker.lorem.words(),
    planting_depth: faker.datatype.number(10000),
    row_width: faker.datatype.number(10000),
    row_spacing: faker.datatype.number(10000),
    ...defaultData,
  };
}

async function bed_methodFactory(
  {
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedField = fieldFactory({ promisedFarm, promisedLocation }),
    promisedCrop = cropFactory({ promisedFarm }),
    promisedCropVariety = crop_varietyFactory({ promisedCrop }),
    promisedManagementPlan = management_planFactory({
      promisedFarm,
      promisedLocation,
      promisedField,
      promisedCropVariety,
      promisedCrop,
    }),
  } = {},
  {
    planting_management_plan = fakePlantingManagementPlan({ planting_method: 'BED_METHOD' }),
    bed_method = fakeBedMethod(),
  } = {},
) {
  const [{ management_plan_id }] = await crop_management_planFactory(
    {
      promisedFarm,
      promisedLocation,
      promisedField,
      promisedCropVariety,
      promisedCrop,
      promisedManagementPlan,
    },
    {
      cropManagementPlan: { ...fakeCropManagementPlan(), needs_transplant: false },
      plantingManagementPlans: [
        {
          planting_management_plan: {
            ...planting_management_plan,
            is_final_planting_management_plan: true,
          },
          bed_method,
        },
      ],
    },
  );
  const { planting_management_plan_id } = await knex('planting_management_plan')
    .where({
      management_plan_id,
      is_final_planting_management_plan: true,
    })
    .first();
  return knex('bed_method').where({ planting_management_plan_id });
}

function fakeBedMethod(defaultData = {}) {
  return {
    number_of_beds: faker.datatype.number(1000),
    number_of_rows_in_bed: faker.datatype.number(1000),
    plant_spacing: faker.datatype.number(1000),
    bed_length: faker.datatype.number(1000),
    planting_depth: faker.datatype.number(1000),
    bed_width: faker.datatype.number(1000),
    bed_spacing: faker.datatype.number(1000),
    specify_beds: `1-${faker.datatype.number(1000)}`,
    ...defaultData,
  };
}

async function crop_varietyFactory(
  { promisedFarm = farmFactory(), promisedCrop = cropFactory({ promisedFarm }) } = {},
  cropVariety = fakeCropVariety(),
) {
  const [farm, crop] = await Promise.all([promisedFarm, promisedCrop]);
  const [{ crop_id, created_by_user_id }] = crop;
  const [{ farm_id }] = farm;
  const base = baseProperties(created_by_user_id);
  return knex('crop_variety')
    .insert({ farm_id, crop_id, ...cropVariety, ...base })
    .returning('*');
}

function fakeCropVariety(defaultData = {}) {
  return {
    crop_variety_name: faker.lorem.word(),
    crop_varietal: faker.lorem.word(),
    crop_cultivar: faker.lorem.word(),
    supplier: faker.lorem.word(),
    seeding_type: faker.helpers.arrayElement(['SEED', 'SEEDLING_OR_PLANTING_STOCK']),
    lifecycle: faker.helpers.arrayElement(['ANNUAL', 'PERENNIAL']),
    compliance_file_url: faker.internet.url(),
    organic: faker.datatype.boolean(),
    treated: faker.helpers.arrayElement(['YES', 'NO', 'NOT_SURE']),
    genetically_engineered: faker.datatype.boolean(),
    searched: faker.datatype.boolean(),
    protein: faker.datatype.number(10),
    lipid: faker.datatype.number(10),
    energy: faker.datatype.number(10),
    ca: faker.datatype.number(10),
    fe: faker.datatype.number(10),
    mg: faker.datatype.number(10),
    ph: faker.datatype.number(10),
    k: faker.datatype.number(10),
    na: faker.datatype.number(10),
    zn: faker.datatype.number(10),
    cu: faker.datatype.number(10),
    mn: faker.datatype.number(10),
    vita_rae: faker.datatype.number(10),
    vitc: faker.datatype.number(10),
    thiamin: faker.datatype.number(10),
    riboflavin: faker.datatype.number(10),
    niacin: faker.datatype.number(10),
    vitb6: faker.datatype.number(10),
    folate: faker.datatype.number(10),
    vitb12: faker.datatype.number(10),
    nutrient_credits: faker.datatype.number(10),
    crop_variety_photo_url: faker.internet.url(),
    can_be_cover_crop: faker.datatype.boolean(),
    planting_depth: faker.datatype.number(10),
    yield_per_area: faker.datatype.number(10),
    average_seed_weight: faker.datatype.number(10),
    yield_per_plant: faker.datatype.number(10),
    needs_transplant: faker.datatype.boolean(),
    germination_days: faker.datatype.number({ min: 1, max: 10 }),
    transplant_days: faker.datatype.number({ min: 11, max: 20 }),
    harvest_days: faker.datatype.number({ min: 21, max: 30 }),
    termination_days: faker.datatype.number({ min: 31, max: 40 }),
    planting_method: faker.helpers.arrayElement([
      'BROADCAST_METHOD',
      'CONTAINER_METHOD',
      'BED_METHOD',
      'ROW_METHOD',
    ]),
    plant_spacing: faker.datatype.number(100),
    seeding_rate: faker.datatype.number(10000),
    ...defaultData,
  };
}

async function fertilizerFactory(
  { promisedFarm = farmFactory() } = {},
  fertilizer = fakeFertilizer(),
) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('fertilizer')
    .insert({ farm_id, ...fertilizer, ...base })
    .returning('*');
}

function fakeFertilizer(defaultData = {}) {
  return {
    fertilizer_type: faker.lorem.word(),
    moisture_percentage: faker.datatype.number(100),
    n_percentage: faker.datatype.number(100),
    nh4_n_ppm: faker.datatype.number(100),
    p_percentage: faker.datatype.number(100),
    k_percentage: faker.datatype.number(100),
    mineralization_rate: faker.datatype.number(100),
    ...defaultData,
  };
}

async function taskFactory(
  { promisedUser = usersFactory(), promisedTaskType = task_typeFactory() } = {},
  task = fakeTask(),
) {
  const [user, taskType] = await Promise.all([promisedUser, promisedTaskType]);
  const [{ user_id }] = user;
  const [{ task_type_id }] = taskType;
  const base = baseProperties(user_id);
  return knex('task')
    .insert({ task_type_id, owner_user_id: user_id, ...base, ...task })
    .returning('*');
}

function fakeTask(defaultData = {}) {
  return {
    due_date: faker.date.future().toISOString().split('T')[0],
    notes: faker.lorem.words(),
    happiness: faker.helpers.arrayElement([0, 1, 2, 3, 4, 5]),
    ...defaultData,
  };
}

async function productFactory({ promisedFarm = farmFactory() } = {}, product = fakeProduct()) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('product')
    .insert({ ...product, ...base, farm_id })
    .returning('*');
}

function fakeProduct(defaultData = {}) {
  return {
    name: faker.lorem.words(2),
    supplier: faker.lorem.words(3),
    on_permitted_substances_list: faker.helpers.arrayElement(['YES', 'NO', 'NOT_SURE']),
    type: faker.helpers.arrayElement(['soil_amendment_task', 'pest_control_task', 'cleaning_task']),
    ...defaultData,
  };
}

async function soil_amendment_taskFactory(
  { promisedTask = taskFactory(), promisedProduct = productFactory() } = {},
  soil_amendment_task = fakeSoilAmendmentTask(),
) {
  const [task, product] = await Promise.all([promisedTask, promisedProduct]);
  const [{ task_id }] = task;
  const [{ product_id }] = product;
  return knex('soil_amendment_task')
    .insert({ task_id, product_id, ...soil_amendment_task })
    .returning('*');
}

function fakeSoilAmendmentTask(defaultData = {}) {
  return {
    product_quantity: faker.datatype.number(),
    purpose: faker.helpers.arrayElement([
      'structure',
      'moisture_retention',
      'nutrient_availability',
      'ph',
      'other',
    ]),
    ...defaultData,
  };
}

async function management_tasksFactory({
  promisedTask = taskFactory(),
  promisedPlantingManagementPlan = planting_management_planFactory(),
} = {}) {
  const [task, plantingManagementPlan] = await Promise.all([
    promisedTask,
    promisedPlantingManagementPlan,
  ]);
  const [{ task_id }] = task;
  const [{ planting_management_plan_id }] = plantingManagementPlan;
  return knex('management_tasks').insert({ task_id, planting_management_plan_id }).returning('*');
}

async function location_tasksFactory({
  promisedTask = taskFactory(),
  promisedField = fieldFactory(),
} = {}) {
  const [activityLog, field] = await Promise.all([promisedTask, promisedField]);
  const [{ task_id }] = activityLog;
  const [{ location_id }] = field;
  return knex('location_tasks').insert({ task_id, location_id }).returning('*');
}

async function pesticideFactory(
  { promisedFarm = farmFactory() } = {},
  pesticide = fakePesticide(),
) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('pesticide')
    .insert({ farm_id, ...pesticide, ...base })
    .returning('*');
}

function fakePesticide(defaultData = {}) {
  return {
    pesticide_name: faker.lorem.word(),
    entry_interval: faker.datatype.number(20),
    harvest_interval: faker.datatype.number(20),
    active_ingredients: faker.lorem.words(),
    concentration: faker.datatype.number(3000),
    ...defaultData,
  };
}

function fakeTaskType(defaultData = {}) {
  return {
    task_name: faker.lorem.word(),
    ...defaultData,
  };
}

async function task_typeFactory({ promisedFarm = farmFactory() } = {}, taskType = fakeTaskType()) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('task_type')
    .insert({ farm_id, ...taskType, ...base })
    .returning('*');
}

async function populateTaskTypes() {
  const translationKeys = [
    {
      task_translation_key: 'BED_PREPARATION_TASK',
      task_name: 'Bed Preparation',
    },
    {
      task_translation_key: 'SALE_TASK',
      task_name: 'Sales',
    },
    {
      task_translation_key: 'SCOUTING_TASK',
      task_name: 'Scouting',
    },
    {
      task_translation_key: 'HARVEST_TASK',
      task_name: 'Harvesting',
    },
    {
      task_translation_key: 'WASH_AND_PACK_TASK',
      task_name: 'Wash and Pack',
    },
    {
      task_translation_key: 'PEST_CONTROL_TASK',
      task_name: 'Pest Control',
    },
    {
      task_translation_key: 'OTHER_TASK',
      task_name: 'Other',
    },
    {
      task_translation_key: 'BREAK_TASK',
      task_name: 'Break',
    },
    {
      task_translation_key: 'SOIL_TASK',
      task_name: 'Soil Sample Results',
    },
    {
      task_translation_key: 'IRRIGATION_TASK',
      task_name: 'Irrigation',
    },
    {
      task_translation_key: 'TRANSPORT_TASK',
      task_name: 'Transport',
    },
    {
      task_translation_key: 'FIELD_WORK_TASK',
      task_name: 'Field Work',
    },
    {
      task_translation_key: 'SOCIAL_TASK',
      task_name: 'Social',
    },
    {
      task_translation_key: 'CLEANING_TASK',
      task_name: 'Cleaning',
    },
    {
      task_translation_key: 'SOIL_AMENDMENT_TASK',
      task_name: 'Soil Amendment',
    },
    {
      task_translation_key: 'PLANT_TASK',
      task_name: 'Planting',
    },
    {
      task_translation_key: 'TRANSPLANT_TASK',
      task_name: 'Transplant',
    },
  ];
  for (const translationKey of translationKeys) {
    const { task_translation_key } = translationKey;
    const [taskTypeInDb] = await knex('task_type').where({ farm_id: null, task_translation_key });
    if (!taskTypeInDb) {
      await knex('task_type')
        .insert({
          ...translationKey,
          created_by_user_id: null,
          updated_by_user_id: null,
        })
        .returning('*');
    }
  }
}

async function populateFieldWorkTaskTypes() {
  const translationKeys = [
    {
      field_work_type_translation_key: 'COVERING_SOIL',
      field_work_name: 'Covering soil',
    },
    {
      field_work_type_translation_key: 'FENCING',
      field_work_name: 'Fencing',
    },
    {
      field_work_type_translation_key: 'PREPARING_BEDS_OR_ROWS',
      field_work_name: 'Preparing beds or rows',
    },
    {
      field_work_type_translation_key: 'PRUNING',
      field_work_name: 'Pruning',
    },
    {
      field_work_type_translation_key: 'SHADE_CLOTH',
      field_work_name: 'Shade cloth',
    },
    {
      field_work_type_translation_key: 'TERMINATION',
      field_work_name: 'Termination',
    },
    {
      field_work_type_translation_key: 'TILLAGE',
      field_work_name: 'Tillage',
    },
    {
      field_work_type_translation_key: 'WEEDING',
      field_work_name: 'Weeding',
    },
  ];
  for (const translationKey of translationKeys) {
    const { field_work_type_translation_key } = translationKey;
    const [taskTypeInDb] = await knex('field_work_type').where({
      farm_id: null,
      field_work_type_translation_key,
    });
    if (!taskTypeInDb) {
      await knex('field_work_type')
        .insert({
          ...translationKey,
          created_by_user_id: null,
          updated_by_user_id: null,
        })
        .returning('*');
    }
  }
}

async function harvest_use_typeFactory(
  { promisedFarm = farmFactory() } = {},
  harvest_use_type = fakeHarvestUseType(),
) {
  const [farm] = await Promise.all([promisedFarm, usersFactory()]);
  let farm_id;
  if (farm.farm_id) {
    farm_id = farm.farm_id;
  } else {
    farm_id = null;
  }
  return knex('harvest_use_type')
    .insert({ farm_id, ...harvest_use_type })
    .returning('*');
}

function fakeHarvestUseType(defaultData = {}) {
  return {
    harvest_use_type_name: faker.lorem.words(),
    ...defaultData,
  };
}

function fakeHarvestUse(defaultData = {}) {
  return {
    quantity: faker.datatype.number(200),
    ...defaultData,
  };
}

async function createDefaultState() {
  const useTypes = [
    'Sales',
    'Self-Consumption',
    'Animal Feed',
    'Compost',
    'Exchange',
    'Saved for seed',
    'Not Sure',
    'Donation',
    'Other',
  ];
  const uses = await Promise.all(
    useTypes.map(async (type) => {
      const data = {
        harvest_use_type_name: type,
      };
      const [use] = await knex('harvest_use_type').insert(data).returning('*');
      return use;
    }),
  );
  return uses;
}

async function diseaseFactory({ promisedFarm = farmFactory() } = {}, disease = fakeDisease()) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('disease')
    .insert({ farm_id, ...disease, ...base })
    .returning('*');
}

function fakeDisease(defaultData = {}) {
  return {
    disease_scientific_name: faker.lorem.words(),
    disease_common_name: faker.lorem.words(),
    disease_group: faker.helpers.arrayElement([
      'Fungus',
      'Insect',
      'Bacteria',
      'Virus',
      'Deficiency',
      'Mite',
      'Other',
      'Weed',
    ]),
    ...defaultData,
  };
}

async function pest_control_taskFactory(
  { promisedTask = taskFactory(), promisedProduct = productFactory() } = {},
  pestTask = fakePestControlTask(),
) {
  const [task, product] = await Promise.all([promisedTask, promisedProduct]);
  const [{ task_id }] = task;
  const [{ product_id }] = product;
  return knex('pest_control_task')
    .insert({
      task_id,
      product_id,
      ...pestTask,
    })
    .returning('*');
}

function fakePestControlTask(defaultData = {}) {
  return {
    product_quantity: faker.datatype.number(2000),
    pest_target: faker.lorem.words(2),
    control_method: faker.helpers.arrayElement([
      'systemicSpray',
      'foliarSpray',
      'handWeeding',
      'biologicalControl',
      'flameWeeding',
      'soilFumigation',
      'heatTreatment',
      'other',
    ]),
    ...defaultData,
  };
}

async function harvest_taskFactory(
  { promisedTask = taskFactory() } = {},
  harvestLog = fakeHarvestTask(),
) {
  const [activity] = await Promise.all([promisedTask]);
  const [{ task_id }] = activity;
  return knex('harvest_task')
    .insert({ task_id, ...harvestLog })
    .returning('*');
}

function fakeHarvestTask(defaultData = {}) {
  return {
    projected_quantity: faker.datatype.number(1000),
    ...defaultData,
  };
}

function fakeHarvestTasks(defaultData = {}, number) {
  return [...Array(number)].map(() => ({
    projected_quantity: faker.datatype.number(1000),
    harvest_everything: faker.datatype.boolean(),
    ...defaultData,
  }));
}

async function harvest_useFactory(
  {
    promisedHarvestTask = harvest_taskFactory(),
    promisedHarvestUseType = harvest_use_typeFactory(),
    promisedPlantingManagementPlan = planting_management_planFactory(),
  } = {},
  harvestUse = fakeHarvestUse(),
) {
  const [harvestTask, harvestUseType, plantingManagementPlan] = await Promise.all([
    promisedHarvestTask,
    promisedHarvestUseType,
    promisedPlantingManagementPlan,
  ]);
  const [{ harvest_use_type_id }] = harvestUseType;
  const [{ task_id }] = harvestTask;
  const [{ planting_management_plan_id }] = plantingManagementPlan;
  await knex('management_tasks').insert({ task_id, planting_management_plan_id });
  return knex('harvest_use')
    .insert({ task_id, harvest_use_type_id, ...harvestUse })
    .returning('*');
}

async function plant_taskFactory(
  { promisedTask = taskFactory() } = {},
  plant_task = fakePlantTask(),
) {
  const [activity] = await Promise.all([promisedTask]);
  const [{ task_id }] = activity;
  return knex('plant_task')
    .insert({ task_id, ...plant_task })
    .returning('*');
}

function fakePlantTask(defaultData = {}) {
  return {
    ...defaultData,
  };
}

async function transplant_taskFactory(
  {
    promisedTask = taskFactory(),
    promisedMgtPlan = planting_management_planFactory(),
    promisedPrevMgtPlan = planting_management_planFactory(),
  } = {},
  transplant_task = fakePlantTask(),
) {
  const [
    activity,
    [{ planting_management_plan_id }],
    [{ planting_management_plan_id: prev_planting_management_plan_id }],
  ] = await Promise.all([promisedTask, promisedMgtPlan, promisedPrevMgtPlan]);
  const [{ task_id }] = activity;
  return knex('transplant_task')
    .insert({
      task_id,
      planting_management_plan_id,
      prev_planting_management_plan_id,
      ...transplant_task,
    })
    .returning('*');
}

function fakeTransplantTask(defaultData = {}) {
  return {
    ...defaultData,
  };
}

async function field_work_taskFactory(
  { promisedTask = taskFactory() } = {},
  field_work_task = fakeFieldWorkTask(),
) {
  const [activity] = await Promise.all([promisedTask]);
  const [{ task_id }] = activity;
  return knex('field_work_task')
    .insert({ task_id, ...field_work_task })
    .returning('*');
}

function fakeFieldWorkTask(defaultData = {}) {
  return {
    ...defaultData,
  };
}

async function soil_taskFactory({ promisedTask = taskFactory() } = {}, soil_task = fakeSoilTask()) {
  const [activity] = await Promise.all([promisedTask]);
  const [{ task_id }] = activity;
  return knex('soil_task')
    .insert({ task_id, ...soil_task })
    .returning('*');
}

function fakeSoilTask(defaultData = {}) {
  return {
    texture: faker.helpers.arrayElement([
      'sand',
      'loamySand',
      'sandyLoam',
      'loam',
      'siltLoam',
      'silt',
      'sandyClayLoam',
      'clayLoam',
      'siltyClayLoam',
      'sandyClay',
      'siltyClay',
      'clay',
    ]),
    k: faker.datatype.number(1000),
    p: faker.datatype.number(1000),
    n: faker.datatype.number(1000),
    om: faker.datatype.number(1000),
    ph: faker.datatype.number(1000),
    'bulk_density_kg/m3': faker.datatype.number(1000),
    organic_carbon: faker.datatype.number(1000),
    inorganic_carbon: faker.datatype.number(1000),
    s: faker.datatype.number(1000),
    ca: faker.datatype.number(1000),
    mg: faker.datatype.number(1000),
    zn: faker.datatype.number(1000),
    mn: faker.datatype.number(1000),
    fe: faker.datatype.number(1000),
    cu: faker.datatype.number(1000),
    b: faker.datatype.number(1000),
    cec: faker.datatype.number(1000),
    c: faker.datatype.number(1000),
    na: faker.datatype.number(1000),
    total_carbon: faker.datatype.number(1000),
    depth_cm: faker.helpers.arrayElement(['5', '10', '20', '30', '50', '100']),
    ...defaultData,
  };
}

async function irrigation_taskFactory(
  { promisedTask = taskFactory() } = {},
  irrigationTask = fakeIrrigationTask(),
) {
  const [activity] = await Promise.all([promisedTask]);
  const [{ task_id }] = activity;
  return knex('irrigation_task')
    .insert({ task_id, ...irrigationTask })
    .returning('*');
}

function fakeIrrigationTask(defaultData = {}) {
  return {
    irrigation_type_name: faker.helpers.arrayElement(['HAND_WATERING']),
    estimated_duration: faker.datatype.number(10),
    ...defaultData,
  };
}

async function scouting_taskFactory(
  { promisedTask = taskFactory() } = {},
  scouting_task = fakeScoutingTask(),
) {
  const [activity] = await Promise.all([promisedTask]);
  const [{ task_id }] = activity;
  return knex('scouting_task')
    .insert({ task_id, ...scouting_task })
    .returning('*');
}

function fakeScoutingTask(defaultData = {}) {
  return {
    type: faker.helpers.arrayElement(['harvest', 'pest', 'disease', 'weed', 'other']),
    ...defaultData,
  };
}

async function saleFactory({ promisedUserFarm = userFarmFactory() } = {}, sale = fakeSale()) {
  const [userFarm] = await Promise.all([promisedUserFarm]);
  const [{ user_id, farm_id }] = userFarm;
  const base = baseProperties(user_id);
  return knex('sale')
    .insert({ farm_id, ...sale, ...base })
    .returning('*');
}

function fakeSale(defaultData = {}) {
  return {
    customer_name: faker.name.findName(),
    sale_date: faker.date.recent(),
    ...defaultData,
  };
}
function fakeExpenseType(defaultData = {}) {
  return {
    expense_name: faker.finance.transactionType(),
    ...defaultData,
  };
}

function fakeCropVarietySale(defaultData = {}) {
  return {
    sale_value: faker.datatype.number(1000),
    quantity: faker.datatype.number(1000),
    quantity_unit: faker.helpers.arrayElement(['kg', 'mt', 'lb', 't']),
    ...defaultData,
  };
}

async function crop_variety_saleFactory(
  { promisedCropVariety = crop_varietyFactory(), promisedSale = saleFactory() } = {},
  cropVarietySale = fakeCropVarietySale(),
) {
  const [cropVariety, sale] = await Promise.all([promisedCropVariety, promisedSale]);
  const [{ crop_variety_id }] = cropVariety;
  const [{ sale_id }] = sale;
  return knex('crop_variety_sale')
    .insert({ crop_variety_id, sale_id, ...cropVarietySale })
    .returning('*');
}

function fakeSupportTicket(farm_id, defaultData = {}) {
  const support_type = ['Request information', 'Report a bug', 'Request a feature', 'Other'];
  const contact_method = ['email', 'whatsapp'];
  const status = ['Open', 'Closed', 'In progress'];
  const numberOfImage = faker.datatype.number(10);
  const attachments = [];
  for (let i = 0; i < numberOfImage; i++) {
    attachments.push(faker.image.imageUrl());
  }

  return {
    support_type: faker.helpers.arrayElement(support_type),
    contact_method: faker.helpers.arrayElement(contact_method),
    status: faker.helpers.arrayElement(status),
    message: faker.lorem.paragraphs(),
    attachments,
    email: faker.internet.email(),
    whatsapp: faker.phone.phoneNumber(),
    farm_id,
    ...defaultData,
  };
}

async function supportTicketFactory(
  { promisedUser = usersFactory(), promisedFarm = {} } = {},
  supportTicket = fakeSupportTicket(),
) {
  const [user, farm] = await Promise.all([promisedUser, promisedFarm]);
  const { user_id } = user;
  const { farm_id } = farm;
  const base = baseProperties(user_id);
  return knex('supportTicket')
    .insert({
      farm_id,
      ...supportTicket,
      ...base,
      attachments: JSON.stringify(supportTicket.attachments),
    })
    .returning('*');
}

function fakeOrganicCertifierSurvey(farm_id, defaultData = {}) {
  const certificationIDS = [1, 2];
  const certifierIDS = [1, 2, 3, 4, 5, 6, 7, 10, 13, 15, 16, 17, 18];
  const past = faker.date.past();
  const now = new Date();
  return {
    certifier_id: faker.helpers.arrayElement(certifierIDS),
    certification_id: faker.helpers.arrayElement(certificationIDS),
    created_at: past,
    updated_at: faker.date.between(past, now),
    interested: faker.datatype.boolean(),
    farm_id,
    ...defaultData,
  };
}

function baseProperties(user_id) {
  return {
    created_by_user_id: user_id,
    updated_by_user_id: user_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function organicCertifierSurveyFactory(
  { promisedUserFarm = userFarmFactory() } = {},
  organicCertifierSurvey = fakeOrganicCertifierSurvey(),
) {
  const [userFarm] = await Promise.all([promisedUserFarm]);
  const [{ farm_id, user_id }] = userFarm;
  return knex('organicCertifierSurvey')
    .insert({
      ...organicCertifierSurvey,
      farm_id,
      created_by_user_id: user_id,
      updated_by_user_id: user_id,
    })
    .returning('*');
}

async function barnFactory(
  {
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedArea = areaFactory({ promisedLocation }, fakeArea(), 'barn'),
  } = {},
  barn = fakeBarn(),
) {
  const [location] = await Promise.all([promisedLocation, promisedArea]);
  const [{ location_id }] = location;
  return knex('barn')
    .insert({ location_id, ...barn })
    .returning('*');
}

function fakeBarn(defaultData = {}) {
  return {
    wash_and_pack: faker.datatype.boolean(),
    cold_storage: faker.datatype.boolean(),
    used_for_animals: faker.datatype.boolean(),
    ...defaultData,
  };
}

async function greenhouseFactory(
  {
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedArea = areaFactory({ promisedLocation }, fakeArea(), 'greenhouse'),
  } = {},
  greenhouse = fakeGreenhouse(),
) {
  const [location] = await Promise.all([promisedLocation, promisedArea]);
  const [{ location_id }] = location;
  return knex('greenhouse')
    .insert({ location_id, ...greenhouse })
    .returning('*');
}

function fakeGreenhouse(defaultData = {}) {
  return {
    organic_status: faker.helpers.arrayElement(['Non-Organic', 'Transitional', 'Organic']),
    ...defaultData,
  };
}

async function watercourseFactory(
  { promisedFarm = farmFactory(), promisedLocation = locationFactory({ promisedFarm }) } = {},
  watercourse = fakeWatercourse(),
) {
  const [location] = await Promise.all([promisedLocation]);
  const [{ location_id }] = location;
  await lineFactory({ promisedLocation: location }, fakeLine(), 'watercourse');
  return knex('watercourse')
    .insert({ location_id, ...watercourse })
    .returning('*');
}

function fakeWatercourse(defaultData = {}) {
  return {
    used_for_irrigation: faker.datatype.boolean(),
    buffer_width: faker.datatype.number(),
    ...defaultData,
  };
}

async function water_valveFactory(
  {
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedPoint = pointFactory({ promisedLocation }, fakePoint(), 'water_valve'),
  } = {},
  water_valve = fakeWaterValve(),
) {
  const [location] = await Promise.all([promisedLocation, promisedPoint]);
  const [{ location_id }] = location;
  return knex('water_valve')
    .insert({ location_id, ...water_valve })
    .returning('*');
}

function fakeWaterValve(defaultData = {}) {
  return {
    source: faker.helpers.arrayElement([
      'Municipal water',
      'Surface water',
      'Groundwater',
      'Rain water',
    ]),
    flow_rate_unit: faker.helpers.arrayElement(['l/min', 'l/h', 'gal/min', 'gal/h']),
    flow_rate: faker.datatype.number(1000),
    ...defaultData,
  };
}

async function surface_waterFactory(
  {
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedArea = areaFactory({ promisedLocation }, fakeArea(), 'surface_water'),
  } = {},
  surface_water = fakeSurfaceWater(),
) {
  const [location] = await Promise.all([promisedLocation, promisedArea]);
  const [{ location_id }] = location;
  return knex('surface_water')
    .insert({ location_id, ...surface_water })
    .returning('*');
}

function fakeSurfaceWater(defaultData = {}) {
  return {
    used_for_irrigation: faker.datatype.boolean(),
    ...defaultData,
  };
}

async function pointFactory(
  { promisedFarm = farmFactory(), promisedLocation = locationFactory({ promisedFarm }) } = {},
  point = fakePoint(),
  pointType,
) {
  const [location] = await Promise.all([promisedLocation]);
  const [{ location_id }] = location;
  const { type, ...realPoint } = point;
  const [{ figure_id }] = await figureFactory(location_id, pointType ? pointType : type);
  return knex('point')
    .insert({ figure_id, ...realPoint })
    .returning('*');
}

async function baseArea(
  asset,
  {
    promisedFarm = farmFactory(),
    promisedLocation = locationFactory({ promisedFarm }),
    promisedArea = areaFactory({ promisedLocation }, fakeArea(), asset),
  } = {},
) {
  const [location] = await Promise.all([promisedLocation, promisedArea]);
  const [{ location_id }] = location;
  return knex(asset).insert({ location_id }).returning('*');
}

async function natural_areaFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}) {
  return await baseArea('natural_area', { promisedLocation });
}

async function ceremonial_areaFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}) {
  return await baseArea('ceremonial_area', { promisedLocation });
}

async function residenceFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}) {
  return await baseArea('residence', { promisedLocation });
}

async function farm_site_boundaryFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}) {
  return await baseArea('farm_site_boundary', { promisedLocation });
}

async function buffer_zoneFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
  promisedLine = lineFactory({ promisedLocation }, fakeLine(), 'buffer_zone'),
} = {}) {
  const [location] = await Promise.all([promisedLocation, promisedLine]);
  const [{ location_id }] = location;
  return knex('buffer_zone').insert({ location_id }).returning('*');
}

async function gateFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
  promisedPoint = pointFactory({ promisedLocation }, fakePoint(), 'gate'),
} = {}) {
  const [location] = await Promise.all([promisedLocation, promisedPoint]);
  const [{ location_id }] = location;
  return knex('gate').insert({ location_id }).returning('*');
}

function fakePoint(defaultData = {}) {
  return {
    point: {
      lat: Number(faker.address.latitude()),
      lng: Number(faker.address.longitude()),
    },
    ...defaultData,
  };
}

async function documentFactory(
  { promisedFarm = farmFactory(), creatorUser = usersFactory() } = {},
  document = fakeDocument(),
) {
  const [farm, user] = await Promise.all([promisedFarm, creatorUser]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('document')
    .insert({ farm_id, ...document, ...base })
    .returning('*');
}

function fakeDocument(defaultData = {}) {
  return {
    name: faker.lorem.words(),
    thumbnail_url: faker.image.imageUrl(),
    valid_until: faker.date.future().toISOString().split('T')[0],
    notes: faker.lorem.words(),
    type: faker.helpers.arrayElement([
      'CLEANING_PRODUCT',
      'CROP_COMPLIANCE',
      'FERTILIZING_PRODUCT',
      'PEST_CONTROL_PRODUCT',
      'SOIL_AMENDMENT',
      'OTHER',
    ]),
    ...defaultData,
  };
}

async function fileFactory(
  {
    promisedFarm = farmFactory(),
    creatorUser = usersFactory(),
    promisedDocument = documentFactory({ promisedFarm, creatorUser }),
  } = {},
  file = fakeFile(),
) {
  const [document] = await Promise.all([promisedDocument]);
  const [{ document_id }] = document;
  return knex('file')
    .insert({ document_id, ...file })
    .returning('*');
}

function fakeFile(defaultData = {}) {
  return {
    file_name: faker.lorem.words(),
    thumbnail_url: faker.image.imageUrl(),
    url: faker.image.imageUrl(),
    ...defaultData,
  };
}

async function notification_userFactory(
  { promisedUserFarm = userFarmFactory() } = {},
  notificationUser = fakeNotificationUser(),
  notification = fakeNotification(),
) {
  const [userFarm] = await Promise.all([promisedUserFarm]);
  const [{ user_id, farm_id }] = userFarm;
  const [{ notification_id }] = await knex('notification')
    .insert({ ...notification, farm_id })
    .returning('*');

  return await knex('notification_user')
    .insert({
      ...notificationUser,
      notification_id,
      user_id,
    })
    .returning('*');
}

function fakeNotificationUser(defaultData = {}) {
  return {
    notification_id: faker.datatype.uuid(),
    user_id: faker.datatype.uuid(),
    alert: true,
    status: 'Unread',
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    ...defaultData,
  };
}

function fakeNotification(defaultData = {}) {
  const notification_id = faker.datatype.uuid();
  return {
    notification_id,
    title: { translation_key: `title_translation_key of notification ${notification_id}` },
    body: { translation_key: `body_translation_key of notification ${notification_id}` },
    variables: [],
    ref: {
      entity: { id: faker.datatype.uuid(), type: `entity_type of notification ${notification_id}` },
    },
    context: {},
    farm_id: faker.datatype.uuid(),
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    ...defaultData,
  };
}

async function populateDefaultRevenueTypes() {
  const types = [
    {
      revenue_name: 'Crop Sale',
      revenue_translation_key: 'CROP_SALE',
      agriculture_associated: null,
      crop_generated: true,
    },
  ];
  for (const type of types) {
    const [revenueTypeInDb] = await knex('revenue_type').where({
      revenue_name: type.revenue_name,
    });
    if (!revenueTypeInDb) {
      const base = baseProperties(1);
      return knex('revenue_type')
        .insert({ ...type, ...base })
        .returning('*');
    }
  }
}

function fakeRevenueType(defaultData = {}) {
  const name = faker.lorem.word();
  return {
    revenue_name: name,
    revenue_translation_key: name,
    ...defaultData,
  };
}

async function revenue_typeFactory(
  { promisedFarm = farmFactory(), properties = {} } = {},
  revenueType = fakeRevenueType(properties),
) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('revenue_type')
    .insert({ farm_id, ...revenueType, ...base })
    .returning('*');
}

function fakeCustomAnimalType(defaultData = {}) {
  const name = faker.lorem.word();
  return {
    type: name,
    ...defaultData,
  };
}

async function custom_animal_typeFactory(
  { promisedFarm = farmFactory(), properties = {} } = {},
  animalType = fakeCustomAnimalType(properties),
) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('custom_animal_type')
    .insert({ farm_id, ...animalType, ...base })
    .returning('*');
}

async function default_animal_typeFactory() {
  return knex('default_animal_type').insert({ key: faker.lorem.word() }).returning('*');
}

function fakeCustomAnimalBreed(defaultData = {}) {
  const name = faker.lorem.word();
  return {
    breed: name,
    ...defaultData,
  };
}

async function custom_animal_breedFactory(
  {
    promisedFarm = farmFactory(),
    promisedAnimalType = custom_animal_typeFactory({ promisedFarm }),
    properties = {},
  } = {},
  animalBreed = fakeCustomAnimalBreed(properties),
) {
  const [farm, user, animalType] = await Promise.all([
    promisedFarm,
    usersFactory(),
    promisedAnimalType,
  ]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const [{ id: custom_type_id }] = animalType;
  const base = baseProperties(user_id);
  return knex('custom_animal_breed')
    .insert({ farm_id, custom_type_id, ...animalBreed, ...base })
    .returning('*');
}

async function default_animal_breedFactory(promisedAnimalType = default_animal_typeFactory()) {
  const [animalType] = await promisedAnimalType;
  return knex('default_animal_breed')
    .insert({ default_type_id: animalType.id, key: faker.lorem.word() })
    .returning('*');
}

function fakeAnimal(defaultData = {}) {
  const name = faker.lorem.word();
  return {
    name,
    ...defaultData,
  };
}

async function animalFactory(
  {
    promisedFarm = farmFactory(),
    promisedDefaultAnimalType = default_animal_typeFactory(),
    properties = {},
  } = {},
  animal = fakeAnimal(properties),
) {
  const [farm, user, defaultAnimalType] = await Promise.all([
    promisedFarm,
    usersFactory(),
    promisedDefaultAnimalType,
  ]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const [{ id: default_type_id }] = defaultAnimalType;

  const base = baseProperties(user_id);

  return knex('animal')
    .insert({ farm_id, default_type_id, ...animal, ...base })
    .returning('*');
}

function fakeAnimalBatch(defaultData = {}) {
  const name = faker.lorem.word();
  const count = faker.datatype.number({ min: 2 });
  return {
    name,
    count,
    sex_detail: [],
    ...defaultData,
  };
}

async function animal_batchFactory(
  {
    promisedFarm = farmFactory(),
    promisedDefaultAnimalType = default_animal_typeFactory(),
    promisedDefaultAnimalBreed = default_animal_breedFactory(),
    properties = {},
  } = {},
  animalBatch = fakeAnimalBatch(properties),
) {
  const [farm, user, defaultAnimalType, defaultAnimalBreed] = await Promise.all([
    promisedFarm,
    usersFactory(),
    promisedDefaultAnimalType,
    promisedDefaultAnimalBreed,
  ]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const [{ id: default_type_id }] = defaultAnimalType;
  const [{ id: default_breed_id }] = defaultAnimalBreed;

  const base = baseProperties(user_id);
  return knex
    .transaction(async (trx) => {
      const sex_detail = animalBatch.sex_detail;
      delete animalBatch.sex_detail;

      const batch = await trx
        .insert({ farm_id, default_type_id, default_breed_id, ...animalBatch, ...base })
        .into('animal_batch')
        .returning('*');

      let details = [];
      for (const detail of sex_detail) {
        const res = await trx
          .insert({ ...detail, animal_batch_id: batch[0].id })
          .into('animal_batch_sex_detail')
          .returning('*');
        details.push(res[0]);
      }
      batch[0].sex_detail = details;
      return batch;
    })
    .catch((err) => {
      console.error(err);
    });
}

async function animal_identifier_colorFactory() {
  return knex('animal_identifier_color').insert({ key: faker.lorem.word() }).returning('*');
}

async function animal_identifier_placementFactory(
  promisedAnimalType = default_animal_typeFactory(),
) {
  const [animalType] = await promisedAnimalType;
  return knex('animal_identifier_placement')
    .insert({ default_type_id: animalType.id, key: faker.lorem.word() })
    .returning('*');
}

async function animal_sexFactory() {
  return knex('animal_sex').insert({ key: faker.lorem.word() }).returning('*');
}

async function animal_originFactory() {
  return knex('animal_origin').insert({ key: faker.lorem.word() }).returning('*');
}

function fakeAnimalGroup(defaultData = {}) {
  const name = faker.lorem.word();
  const notes = faker.lorem.word();
  return {
    name,
    notes,
    ...defaultData,
  };
}

async function animal_groupFactory(
  { promisedFarm = farmFactory(), properties = {} } = {},
  animalGroup = fakeAnimalGroup(properties),
) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;

  const base = baseProperties(user_id);
  return knex('animal_group')
    .insert({
      farm_id,
      ...animalGroup,
      ...base,
    })
    .returning('*');
}

async function animal_group_relationshipFactory({
  promisedAnimal = animalFactory(),
  promisedGroup = animal_groupFactory(),
} = {}) {
  const [animal, group] = await Promise.all([promisedAnimal, promisedGroup]);
  const [{ id: groupId }] = group;
  const [{ id: animalId }] = animal;
  return knex('animal_group_relationship')
    .insert({
      animal_group_id: groupId,
      animal_id: animalId,
    })
    .returning('*');
}

async function animal_batch_group_relationshipFactory({
  promisedBatch = animal_batchFactory(),
  promisedGroup = animal_groupFactory(),
} = {}) {
  const [batch, group] = await Promise.all([promisedBatch, promisedGroup]);
  const [{ id: groupId }] = group;
  const [{ id: batchId }] = batch;
  return knex('animal_batch_group_relationship')
    .insert({
      animal_group_id: groupId,
      animal_batch_id: batchId,
    })
    .returning('*');
}

async function animal_removal_reasonFactory() {
  return knex('animal_removal_reason').insert({ key: faker.lorem.word() }).returning('*');
}

export default {
  weather_stationFactory,
  fakeStation,
  usersFactory,
  fakeUser,
  fakeSSOUser,
  farmFactory,
  fakeFarm,
  userFarmFactory,
  fakeUserFarm,
  fieldFactory,
  fakeField,
  gardenFactory,
  fakeGarden,
  cropFactory,
  fakeCrop,
  management_planFactory,
  fakeManagementPlan,
  crop_management_planFactory,
  fakeCropManagementPlan,
  planting_management_planFactory,
  fakePlantingManagementPlan,
  container_methodFactory,
  fakeContainerMethod,
  broadcast_methodFactory,
  fakeBroadcastMethod,
  row_methodFactory,
  fakeRowMethod,
  bed_methodFactory,
  fakeBedMethod,
  fertilizerFactory,
  fakeFertilizer,
  taskFactory,
  fakeTask,
  harvest_use_typeFactory,
  fakeHarvestUseType,
  createDefaultState,
  harvest_useFactory,
  fakeHarvestUse,
  productFactory,
  fakeProduct,
  soil_amendment_taskFactory,
  fakeSoilAmendmentTask,
  pesticideFactory,
  fakePesticide,
  diseaseFactory,
  fakeDisease,
  pest_control_taskFactory,
  fakePestControlTask,
  harvest_taskFactory,
  fakeHarvestTask,
  fakeHarvestTasks,
  plant_taskFactory,
  fakePlantTask,
  transplant_taskFactory,
  fakeTransplantTask,
  field_work_taskFactory,
  fakeFieldWorkTask,
  soil_taskFactory,
  fakeSoilTask,
  irrigation_taskFactory,
  fakeIrrigationTask,
  scouting_taskFactory,
  fakeScoutingTask,
  saleFactory,
  fakeSale,
  locationFactory,
  fakeLocation,
  fakeTaskType,
  task_typeFactory,
  populateTaskTypes,
  populateFieldWorkTaskTypes,
  yieldFactory,
  fakeYield,
  priceFactory,
  fakePrice,
  fakeCropVarietySale,
  crop_variety_saleFactory,
  farmExpenseTypeFactory,
  fakeExpenseType,
  farmExpenseFactory,
  fakeExpense,
  fakeFieldForTests,
  fakeFence,
  fenceFactory,
  fakeArea,
  areaFactory,
  fakeLine,
  lineFactory,
  management_tasksFactory,
  location_tasksFactory,
  fakeFarmDataSchedule,
  farmDataScheduleFactory,
  fakePriceInsightForTests,
  fakeOrganicCertifierSurvey,
  organicCertifierSurveyFactory,
  fakeSupportTicket,
  supportTicketFactory,
  fakePoint,
  pointFactory,
  fakeSurfaceWater,
  surface_waterFactory,
  fakeBarn,
  barnFactory,
  fakeWaterValve,
  water_valveFactory,
  fakeWatercourse,
  watercourseFactory,
  fakeGreenhouse,
  greenhouseFactory,
  natural_areaFactory,
  ceremonial_areaFactory,
  farm_site_boundaryFactory,
  residenceFactory,
  buffer_zoneFactory,
  gateFactory,
  crop_varietyFactory,
  fakeCropVariety,
  fakeDocument,
  documentFactory,
  fakeFile,
  fileFactory,
  fakeOrganicHistory,
  organic_historyFactory,
  notification_userFactory,
  populateDefaultRevenueTypes,
  revenue_typeFactory,
  fakeRevenueType,
  custom_animal_typeFactory,
  fakeCustomAnimalType,
  default_animal_typeFactory,
  custom_animal_breedFactory,
  fakeCustomAnimalBreed,
  default_animal_breedFactory,
  fakeAnimal,
  fakeAnimalBatch,
  animalFactory,
  animal_batchFactory,
  animal_identifier_colorFactory,
  animal_identifier_placementFactory,
  animal_sexFactory,
  animal_originFactory,
  fakeAnimalGroup,
  animal_groupFactory,
  animal_group_relationshipFactory,
  animal_batch_group_relationshipFactory,
  animal_removal_reasonFactory,
  baseProperties,
};
