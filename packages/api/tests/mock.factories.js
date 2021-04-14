let faker = require('faker');
const knex = require('../src/util/knex');

function weather_stationFactory(station = fakeStation()) {
  return knex('weather_station').insert(station).returning('*');
}

function fakeStation() {
  return {
    id: faker.random.number(0x7FFFFFFF),
    name: faker.address.country(),
    country: faker.address.countryCode(),
    timezone: faker.random.number(1000),
  };
}

function usersFactory(userObject = fakeUser()) {
  return knex('users').insert(userObject).returning('*');
}

function fakeUser() {
  const email = faker.lorem.word() + faker.internet.email();
  return {
    first_name: faker.name.findName(),
    last_name: faker.name.lastName(),
    email: email.toLowerCase(),
    user_id: faker.random.uuid(),
    status_id: 1,
    phone_number: faker.phone.phoneNumber(),
    gender: faker.random.arrayElement(['OTHER', 'PREFER_NOT_TO_SAY', 'MALE', 'FEMALE']),
    birth_year: faker.random.number({ min: 1900, max: new Date().getFullYear() }),
  };
}


function fakeSSOUser() {
  const email = faker.lorem.word() + faker.internet.email();
  return {
    first_name: faker.name.findName(),
    last_name: faker.name.lastName(),
    email: email.toLowerCase(),
    user_id: faker.random.number(10),
    phone_number: faker.phone.phoneNumber(),
  };
}

async function farmFactory(farmObject = fakeFarm()) {
  const [{ user_id }] = await usersFactory();
  const base = baseProperties(user_id);
  return knex('farm').insert({ ...farmObject, ...base }).returning('*');
}

function fakeFarm() {
  return {
    farm_name: faker.company.companyName(),
    address: faker.address.streetAddress(),
    grid_points: {
      lat: faker.address.latitude(),
      lng: faker.address.longitude(),
    },
    farm_phone_number: faker.phone.phoneNumber(),
  };
}

async function userFarmFactory({
  promisedUser = usersFactory(),
  promisedFarm = farmFactory(),
} = {}, userFarm = fakeUserFarm()) {
  const [user, farm] = await Promise.all([promisedUser, promisedFarm]);
  const [{ user_id }] = user;
  const [{ farm_id }] = farm;
  return knex('userFarm').insert({ user_id, farm_id, ...userFarm }).returning('*');
}

function fakeUserFarm() {
  return {
    role_id: faker.random.arrayElement([1, 2, 3, 5]),
    status: 'Active',
    has_consent: true,
    step_one: false,
    wage: { type: 'hourly', amount: faker.random.number(300) },
  };
}

async function farmDataScheduleFactory({
  promisedUser = usersFactory(),
  promisedFarm = farmFactory(),
} = {}, farmDataSchedule = fakeFarmDataSchedule()) {
  const [user, farm] = await Promise.all([promisedUser, promisedFarm]);
  const [{ user_id }] = user;
  const [{ farm_id }] = farm;
  return knex('farmDataSchedule').insert({ user_id, farm_id, ...farmDataSchedule }).returning('*');
}

function fakeFarmDataSchedule() {
  return {
    has_failed: false,
  };
}

async function locationFactory({ promisedFarm = farmFactory() } = {}, location = fakeLocation()) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('location').insert({ farm_id, ...base, ...location }).returning('*');
}

function fakeLocation() {
  return {
    name: faker.random.arrayElement(['Location1', 'Nice Location', 'Fence', 'AreaLocation']),
    notes: faker.lorem.word(3),
  };
}

async function areaFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}, area = fakeArea(), areaType) {
  const [location] = await Promise.all([promisedLocation]);
  const [{ location_id }] = location;
  const { type, ...realArea } = area;
  const [{ figure_id }] = await figureFactory(location_id, areaType ? areaType : type);
  return knex('area').insert({ figure_id, ...realArea }).returning('*');
}

function figureFactory(location_id, type) {
  return knex('figure').insert({ location_id, type }).returning('*');
}

function fakeArea(stringify = true) {
  return {
    total_area: faker.random.number(2000),
    grid_points: stringify ? JSON.stringify([...Array(3).map(() => ({
      lat: faker.address.latitude(),
      lng: faker.address.longitude(),
    }))]) : [...Array(3).map(() => ({
      lat: faker.address.latitude(),
      lng: faker.address.longitude(),
    }))],
    perimeter: faker.random.number(),
    total_area_unit: faker.random.arrayElement(['m2', 'ha', 'ft2', 'ac']),
    perimeter_unit: faker.random.arrayElement(['m', 'km', 'ft', 'mi']),
  };
}

async function fieldFactory({
  promisedStation = weather_stationFactory(),
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
  promisedArea = areaFactory({ promisedLocation }, fakeArea(), 'field'),
} = {}, field = fakeField()) {
  const [station, location] = await Promise.all([promisedStation, promisedLocation, promisedArea]);
  const [{ station_id }] = station;
  const [{ location_id }] = location;
  return knex('field').insert({ location_id: location_id, station_id, ...field }).returning('*');
}

function fakeField() {
  return {
    organic_status: faker.random.arrayElement(['Non-Organic', 'Transitional', 'Organic']),
    transition_date: faker.date.future(),
  };
}

async function gardenFactory({
  promisedStation = weather_stationFactory(),
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
  promisedArea = areaFactory({ promisedLocation }, fakeArea(), 'garden'),
} = {}, garden = fakeGarden()) {
  const [station, location] = await Promise.all([promisedStation, promisedLocation, promisedArea]);
  const [{ station_id }] = station;
  const [{ location_id }] = location;
  return knex('garden').insert({ location_id: location_id, station_id, ...garden }).returning('*');
}

function fakeGarden() {
  return {
    organic_status: faker.random.arrayElement(['Non-Organic', 'Transitional', 'Organic']),
    transition_date: faker.date.future(),
  };
}

function fakeFieldForTests() {
  return {
    ...fakeField(), grid_points: [{
      lat: faker.address.latitude(),
      lng: faker.address.longitude(),
    }],
  };
}

function fakePriceInsightForTests() {
  return {
    distance: faker.random.arrayElement([5, 10, 25, 50]),
    lat: faker.address.latitude(),
    long: faker.address.latitude(),
    startdate: '2021-10-10',
  };
}

async function lineFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}, line = fakeLine(), lineType) {
  const [location] = await Promise.all([promisedLocation]);
  const [{ location_id }] = location;
  const { type, ...realLine } = line;
  const [{ figure_id }] = await figureFactory(location_id, lineType ? lineType : type);
  return knex('line').insert({ figure_id, ...realLine }).returning('*');
}

function fakeLine(stringify = true) {
  return {
    length: faker.random.number(),
    width: faker.random.number(),
    line_points: stringify ? JSON.stringify([...Array(2).map(() => ({
      lat: faker.address.latitude(),
      lng: faker.address.longitude(),
    }))]) : [...Array(2).map(() => ({
      lat: faker.address.latitude(),
      lng: faker.address.longitude(),
    }))],
  };
}

async function fenceFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}, fence = fakeFence()) {
  const [location] = await Promise.all([promisedLocation]);
  const [{ location_id }] = location;
  await lineFactory({ promisedLocation: location }, fakeLine(), 'fence');
  return knex('fence').insert({ location_id, ...fence }).returning('*');
}

function fakeFence() {
  return {
    pressure_treated: faker.random.boolean(),
  };
}

async function cropFactory({ promisedFarm = farmFactory(), createdUser = usersFactory() } = {}, crop = fakeCrop()) {
  const [farm, user] = await Promise.all([promisedFarm, createdUser]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('crop').insert({ farm_id, ...crop, ...base }).returning('*');
}

async function yieldFactory({ promisedCrop = cropFactory() } = {}, yield1 = fakeYield()) {
  const [crop] = await Promise.all([promisedCrop]);
  const [{ crop_id }] = crop;
  const [{ farm_id }] = crop;
  return knex('yield').insert({ crop_id, farm_id, ...yield1 }).returning('*');
}

async function priceFactory({ promisedCrop = cropFactory() } = {}, price = fakePrice()) {
  const [crop] = await Promise.all([promisedCrop]);
  const [{ crop_id }] = crop;
  const [{ farm_id }] = crop;
  return knex('price').insert({ crop_id, farm_id, ...price }).returning('*');
}

async function farmExpenseTypeFactory({ promisedFarm = farmFactory() } = {}, expense_type = fakeExpenseType()) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('farmExpenseType').insert({ farm_id, ...expense_type, ...base }).returning('*');
}

async function farmExpenseFactory({
  promisedExpenseType = farmExpenseTypeFactory(),
  promisedUserFarm = userFarmFactory(),
} = {}, expense = fakeExpense()) {
  const [expense_type, user] = await Promise.all([promisedExpenseType, promisedUserFarm]);
  const [{ expense_type_id }] = expense_type;
  const [{ user_id }] = user;
  const [{ farm_id }] = expense_type;
  const base = baseProperties(user_id);
  return knex('farmExpense').insert({ expense_type_id, farm_id, ...expense, ...base }).returning('*');
}

function fakeCrop() {
  return {
    crop_common_name: faker.lorem.words(),
    crop_genus: faker.lorem.words(),
    crop_specie: faker.lorem.words(),
    crop_group: faker.random.arrayElement(['Fruit and nuts', 'Beverage and spice crops', 'Potatoes and yams', 'Vegetables and melons']),
    crop_subgroup: faker.random.arrayElement(['Fibre crops', 'Grasses and other fodder crops', 'Nuts', 'Temporary spice crops',
      'Pome fruits and stone fruits', 'Other crops', 'High starch Root/tuber crops', 'Leafy or stem vegetables',
      'Tropical and subtropical fruits', 'Cereals', 'Legumes', 'Sugar crops (root)', 'Citrus fruits',
      'Permanent spice crops', 'Berries', 'Fruit-bearing vegetables', 'Other fruits', 'Root, bulb, or tuberous vegetables',
      'Temporary oilseed crops', 'Permanent oilseed crops', 'Medicinal, aromatic, pesticidal, or similar crops',
      'Grapes', 'Flower crops', 'Mushrooms and truffles', 'Rubber', 'Sugar crops (other)', 'Tobacco']),
    max_rooting_depth: faker.random.number(10),
    depletion_fraction: faker.random.number(10),
    is_avg_depth: faker.random.boolean(),
    initial_kc: faker.random.number(10),
    mid_kc: faker.random.number(10),
    end_kc: faker.random.number(10),
    max_height: faker.random.number(10),
    is_avg_kc: faker.random.boolean(),
    nutrient_notes: faker.lorem.words(),
    percentrefuse: faker.random.number(10),
    refuse: faker.lorem.words(),
    protein: faker.random.number(10),
    lipid: faker.random.number(10),
    energy: faker.random.number(10),
    ca: faker.random.number(10),
    fe: faker.random.number(10),
    mg: faker.random.number(10),
    ph: faker.random.number(10),
    k: faker.random.number(10),
    na: faker.random.number(10),
    zn: faker.random.number(10),
    cu: faker.random.number(10),
    fl: faker.random.number(10),
    mn: faker.random.number(10),
    se: faker.random.number(10),
    vita_rae: faker.random.number(10),
    vite: faker.random.number(10),
    vitc: faker.random.number(10),
    thiamin: faker.random.number(10),
    riboflavin: faker.random.number(10),
    niacin: faker.random.number(10),
    pantothenic: faker.random.number(10),
    vitb6: faker.random.number(10),
    folate: faker.random.number(10),
    vitb12: faker.random.number(10),
    vitk: faker.random.number(10),
    is_avg_nutrient: faker.random.boolean(),
    user_added: faker.random.boolean(),
    deleted: false,
    nutrient_credits: faker.random.number(10),
  };
}

function fakeYield() {
  return {
    yield_id: faker.random.number(0x7FFFFFFF),
    'quantity_kg/m2': faker.random.number(10),
    date: faker.date.future(),
  };
}

function fakePrice() {
  return {
    price_id: faker.random.number(0x7FFFFFFF),
    'value_$/kg': faker.random.number(100),
    date: faker.date.future(),
  };
}

function fakeExpense() {
  return {
    expense_date: faker.date.future(),
    value: faker.random.number(100),
    note: faker.helpers.randomize(),
  };
}

async function fieldCropFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
  promisedField = fieldFactory({ promisedFarm, promisedLocation }),
  promisedCrop = cropFactory(),
} = {}, fieldCrop = fakeFieldCrop()) {
  const [location, field, crop] = await Promise.all([promisedLocation, promisedField, promisedCrop]);
  const [{ created_by_user_id }] = location;
  const [{ location_id }] = field;
  const [{ crop_id }] = crop;
  const base = baseProperties(created_by_user_id);
  return knex('fieldCrop').insert({ location_id: location_id, crop_id, ...fieldCrop, ...base }).returning('*');

}

function fakeFieldCrop() {
  return {
    start_date: faker.date.past(),
    end_date: faker.date.future(),
    area_used: faker.random.number(20000),
    estimated_production: faker.random.number(30000),
    variety: faker.lorem.word(),
    estimated_revenue: faker.random.number(3000),
    is_by_bed: faker.random.boolean(),
  };
}

async function fertilizerFactory({ promisedFarm = farmFactory() } = {}, fertilizer = fakeFertilizer()) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('fertilizer').insert({ farm_id, ...fertilizer, ...base }).returning('*');
}

function fakeFertilizer() {
  return {
    fertilizer_type: faker.lorem.word(),
    moisture_percentage: faker.random.number(100),
    n_percentage: faker.random.number(100),
    nh4_n_ppm: faker.random.number(100),
    p_percentage: faker.random.number(100),
    k_percentage: faker.random.number(100),
    mineralization_rate: faker.random.number(100),
  };
}

async function activityLogFactory({ promisedUser = usersFactory() } = {}, activityLog = fakeActivityLog()) {
  const [user] = await Promise.all([promisedUser]);
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('activityLog').insert({ user_id, ...base, ...activityLog }).returning('*');

}

function fakeActivityLog() {
  return {
    activity_kind: faker.random.arrayElement(['fertilizing', 'pestControl', 'scouting', 'irrigation', 'harvest',
      'seeding', 'fieldWork', 'weatherData', 'soilData', 'other']),
    date: faker.date.future(),
    notes: faker.lorem.words(),
  };
}

async function fertilizerLogFactory({
  promisedActivityLog = activityLogFactory(),
  promisedFertilizer = fertilizerFactory(),
} = {}, fertilizerLog = fakeFertilizerLog()) {
  const [activityLog, fertilizer] = await Promise.all([promisedActivityLog, promisedFertilizer]);
  const [{ activity_id }] = activityLog;
  const [{ fertilizer_id }] = fertilizer;
  return knex('fertilizerLog').insert({ activity_id, fertilizer_id, ...fertilizerLog }).returning('*');
}

function fakeFertilizerLog() {
  return { quantity_kg: faker.random.number(200) };

}

async function activityCropsFactory({
  promisedActivityLog = activityLogFactory(),
  promisedFieldCrop = fieldCropFactory(),
} = {}) {
  const [activityLog, fieldCrop] = await Promise.all([promisedActivityLog, promisedFieldCrop]);
  const [{ activity_id }] = activityLog;
  const [{ field_crop_id }] = fieldCrop;
  return knex('activityCrops').insert({ activity_id, field_crop_id }).returning('*');
}

async function activityFieldsFactory({
  promisedActivityLog = activityLogFactory(),
  promisedField = fieldFactory(),
} = {}) {
  const [activityLog, field] = await Promise.all([promisedActivityLog, promisedField]);
  const [{ activity_id }] = activityLog;
  const [{ location_id }] = field;
  return knex('activityFields').insert({ activity_id, location_id }).returning('*');
}

async function pesticideFactory({ promisedFarm = farmFactory() } = {}, pesticide = fakePesticide()) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('pesticide').insert({ farm_id, ...pesticide, ...base }).returning('*');
}

function fakePesticide() {
  return {
    pesticide_name: faker.lorem.word(),
    entry_interval: faker.random.number(20),
    harvest_interval: faker.random.number(20),
    active_ingredients: faker.lorem.words(),
    concentration: faker.random.number(3000),
  };
}

function fakeTaskType() {
  return {
    task_name: faker.lorem.word(),
  };
}

async function taskTypeFactory({ promisedFarm = farmFactory() } = {}, taskType = fakeTaskType()) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('taskType').insert({ farm_id, ...taskType, ...base }).returning('*');
}

async function harvestUseTypeFactory({ promisedFarm = farmFactory() } = {}, harvestUseType = fakeHarvestUseType()) {
  const [farm] = await Promise.all([promisedFarm, usersFactory()]);
  let farm_id;
  if (farm.farm_id) {
    farm_id = farm.farm_id;
  } else {
    farm_id = null;
  }
  return knex('harvestUseType').insert({ farm_id, ...harvestUseType }).returning('*');
}

function fakeHarvestUseType() {
  return {
    harvest_use_type_name: faker.lorem.words(),
  };
}

function fakeHarvestUse() {
  return {
    quantity_kg: faker.random.number(200),
  };
}

async function createDefaultState() {
  const useTypes = [
    'Sales', 'Self-Consumption', 'Animal Feed', 'Compost', 'Exchange', 'Saved for seed', 'Not Sure', 'Donation', 'Other',
  ];
  const uses = await Promise.all(useTypes.map(async (type) => {
    let data = {
      harvest_use_type_name: type,
    };
    const [use] = await knex('harvestUseType').insert(data).returning('*');
    return use;
  }));
  return uses;
}

async function diseaseFactory({ promisedFarm = farmFactory() } = {}, disease = fakeDisease()) {
  const [farm, user] = await Promise.all([promisedFarm, usersFactory()]);
  const [{ farm_id }] = farm;
  const [{ user_id }] = user;
  const base = baseProperties(user_id);
  return knex('disease').insert({ farm_id, ...disease, ...base }).returning('*');
}

function fakeDisease() {
  return {
    disease_scientific_name: faker.lorem.words(),
    disease_common_name: faker.lorem.words(),
    disease_group: faker.random.arrayElement(['Fungus', 'Insect', 'Bacteria', 'Virus', 'Deficiency', 'Mite', 'Other', 'Weed']),
  };
}


async function pestControlLogFactory({
  promisedActivity = activityLogFactory(),
  promisedPesticide = pesticideFactory(), promisedDisease = diseaseFactory(),
} = {}, pestLog = fakePestControlLog()) {
  const [activity, pesticide, disease] = await Promise.all([promisedActivity, promisedPesticide, promisedDisease]);
  const [{ activity_id }] = activity;
  const [{ pesticide_id }] = pesticide;
  const [{ disease_id }] = disease;
  return knex('pestControlLog').insert({
    activity_id,
    pesticide_id,
    target_disease_id: disease_id, ...pestLog,
  }).returning('*');

}

function fakePestControlLog() {
  return {
    quantity_kg: faker.random.number(2000),
    type: faker.random.arrayElement(['systemicSpray', 'foliarSpray', 'handPick', 'biologicalControl', 'burning', 'soilFumigation', 'heatTreatment']),
  };
}

async function harvestLogFactory({ promisedActivity = activityLogFactory() } = {}, harvestLog = fakeHarvestLog()) {
  const [activity] = await Promise.all([promisedActivity]);
  const [{ activity_id }] = activity;
  return knex('harvestLog').insert({ activity_id, ...harvestLog }).returning('*');
}

function fakeHarvestLog() {
  return {
    quantity_kg: faker.random.number(1000),
  };
}

async function harvestUseFactory({
    promisedHarvestLog = harvestLogFactory(),
    promisedHarvestUseType = harvestUseTypeFactory(),
    promisedFieldCrop = fieldCropFactory(),
  } = {},
  harvestUse = fakeHarvestUse()) {
  const [harvestLog, harvestUseType, fieldCrop] = await Promise.all([promisedHarvestLog, promisedHarvestUseType, promisedFieldCrop]);
  const [{ harvest_use_type_id }] = harvestUseType;
  const [{ activity_id }] = harvestLog;
  const [{ field_crop_id }] = fieldCrop;
  await knex('activityCrops').insert({ activity_id, field_crop_id });
  return knex('harvestUse').insert({ activity_id, harvest_use_type_id, ...harvestUse }).returning('*');
}

async function seedLogFactory({ promisedActivity = activityLogFactory() } = {}, seedLog = fakeSeedLog()) {
  const [activity] = await Promise.all([promisedActivity]);
  const [{ activity_id }] = activity;
  return knex('seedLog').insert({ activity_id, ...seedLog }).returning('*');
}


function fakeSeedLog() {
  return {
    space_depth_cm: faker.random.number(1000),
    space_length_cm: faker.random.number(1000),
    space_width_cm: faker.random.number(1000),
    'rate_seeds/m2': faker.random.number(1000),
  };
}

async function fieldWorkLogFactory({ promisedActivity = activityLogFactory() } = {}, fieldWorkLog = fakeFieldWorkLog()) {
  const [activity] = await Promise.all([promisedActivity]);
  const [{ activity_id }] = activity;
  return knex('fieldWorkLog').insert({ activity_id, ...fieldWorkLog }).returning('*');
}

function fakeFieldWorkLog() {
  return {
    type: faker.random.arrayElement(['plow', 'ridgeTill', 'zoneTill', 'mulchTill', 'ripping', 'discing']),
  };
}

async function soilDataLogFactory({ promisedActivity = activityLogFactory() } = {}, soilDataLog = fakeSoilDataLog()) {
  const [activity] = await Promise.all([promisedActivity]);
  const [{ activity_id }] = activity;
  return knex('soilDataLog').insert({ activity_id, ...soilDataLog }).returning('*');
}

function fakeSoilDataLog() {
  return {
    texture: faker.random.arrayElement(['sand', 'loamySand', 'sandyLoam', 'loam', 'siltLoam', 'silt', 'sandyClayLoam', 'clayLoam', 'siltyClayLoam', 'sandyClay', 'siltyClay', 'clay']),
    k: faker.random.number(1000),
    p: faker.random.number(1000),
    n: faker.random.number(1000),
    om: faker.random.number(1000),
    ph: faker.random.number(1000),
    'bulk_density_kg/m3': faker.random.number(1000),
    organic_carbon: faker.random.number(1000),
    inorganic_carbon: faker.random.number(1000),
    s: faker.random.number(1000),
    ca: faker.random.number(1000),
    mg: faker.random.number(1000),
    zn: faker.random.number(1000),
    mn: faker.random.number(1000),
    fe: faker.random.number(1000),
    cu: faker.random.number(1000),
    b: faker.random.number(1000),
    cec: faker.random.number(1000),
    c: faker.random.number(1000),
    na: faker.random.number(1000),
    total_carbon: faker.random.number(1000),
    depth_cm: faker.random.arrayElement(['5', '10', '20', '30', '50', '100']),
  };
}

async function irrigationLogFactory({ promisedActivity = activityLogFactory() } = {}, irrigationLog = fakeIrrigationLog()) {
  const [activity] = await Promise.all([promisedActivity]);
  const [{ activity_id }] = activity;
  return knex('irrigationLog').insert({ activity_id, ...irrigationLog }).returning('*');
}

function fakeIrrigationLog() {
  return {
    type: faker.random.arrayElement(['sprinkler', 'drip', 'subsurface', 'flood']),
    hours: faker.random.number(10),
    'flow_rate_l/min': faker.random.number(10),
  };
}

async function scoutingLogFactory({ promisedActivity = activityLogFactory() } = {}, scoutingLog = fakeScoutingLog()) {
  const [activity] = await Promise.all([promisedActivity]);
  const [{ activity_id }] = activity;
  return knex('scoutingLog').insert({ activity_id, ...scoutingLog }).returning('*');
}

function fakeScoutingLog() {
  return {
    type: faker.random.arrayElement(['harvest', 'pest', 'disease', 'weed', 'other']),
  };
}

async function shiftFactory({ promisedUserFarm = userFarmFactory() } = {}, shift = fakeShift()) {
  const [userFarm] = await Promise.all([promisedUserFarm]);
  const [{ user_id, farm_id }] = userFarm;
  const base = baseProperties(user_id);
  return knex('shift').insert({ user_id, farm_id, ...base, ...shift }).returning('*');
}

function fakeShift() {
  return {
    shift_date: new Date(),
    mood: faker.random.arrayElement(['happy', 'neutral', 'very happy', 'sad', 'very sad', 'na']),
    wage_at_moment: faker.random.number(20),
  };
}

async function shiftTaskFactory({
  promisedShift = shiftFactory(),
  promisedFieldCrop = fieldCropFactory(), promisedField = fieldFactory(),
  promisedTaskType = taskTypeFactory(),
  promisedUser = usersFactory(),
} = {}, shiftTask = fakeShiftTask()) {
  const [shift, fieldCrop, field, task, user] = await Promise.all([promisedShift, promisedFieldCrop, promisedField, promisedTaskType, promisedUser]);
  const [{ shift_id }] = shift;
  const [{ field_crop_id }] = fieldCrop;
  const [{ location_id }] = field;
  const [{ task_id }] = task;
  const [{ user_id }] = user;
  return knex('shiftTask').insert({
    shift_id,
    location_id,
    field_crop_id,
    task_id, ...shiftTask, ...baseProperties(user_id),
  }).returning('*');
}

function fakeShiftTask() {
  return {
    is_field: faker.random.boolean(),
    duration: faker.random.number(200),
  };
}

async function saleFactory({ promisedUserFarm = userFarmFactory() } = {}, sale = fakeSale()) {
  const [userFarm] = await Promise.all([promisedUserFarm]);
  const [{ user_id, farm_id }] = userFarm;
  const base = baseProperties(user_id);
  return knex('sale').insert({ farm_id, ...sale, ...base }).returning('*');
}

function fakeSale() {
  return {
    customer_name: faker.name.findName(),
    sale_date: faker.date.recent(),
  };
}

function fakeExpenseType() {
  return {
    expense_name: faker.finance.transactionType(),
  };
}

function fakeWaterBalance() {
  return {
    created_at: faker.date.future(),
    soil_water: faker.random.number(2000),
    plant_available_water: faker.random.number(2000),
  };
}

// async function waterBalanceFactory({ promisedFieldCrop = fieldCropFactory() } = {}, waterBalance = fakeWaterBalance()) {
//   const [fieldCrop] = await Promise.all([promisedFieldCrop]);
//   const [{ field_id, crop_id }] = fieldCrop;
//   return knex('waterBalance').insert({ field_id, crop_id, ...waterBalance }).returning('*');
// }

function fakeNitrogenSchedule() {
  return {
    created_at: faker.date.past(),
    scheduled_at: faker.date.future(),
    frequency: faker.random.number(10),
  };
}

async function nitrogenScheduleFactory({ promisedFarm = farmFactory() } = {}, nitrogenSchedule = fakeNitrogenSchedule()) {
  const [farm] = await Promise.all([promisedFarm]);
  const [{ farm_id }] = farm;
  return knex('nitrogenSchedule').insert({ farm_id, ...nitrogenSchedule }).returning('*');
}

function fakeCropSale() {
  return {
    sale_value: faker.random.number(1000),
    quantity_kg: faker.random.number(1000),
  };
}

async function cropSaleFactory({
  promisedCrop = cropFactory(),
  promisedSale = saleFactory(),
} = {}, cropSale = fakeCropSale()) {
  const [crop, sale] = await Promise.all([promisedCrop, promisedSale]);
  const [{ crop_id }] = crop;
  const [{ sale_id }] = sale;
  return knex('cropSale').insert({ crop_id, sale_id, ...cropSale }).returning('*');
}

function fakeSupportTicket(farm_id) {
  const support_type = ['Request information', 'Report a bug', 'Request a feature', 'Other'];
  const contact_method = ['email', 'whatsapp'];
  const status = ['Open', 'Closed', 'In progress'];
  const numberOfImage = faker.random.number(10);
  const attachments = [];
  for (let i = 0; i < numberOfImage; i++) {
    attachments.push(faker.image.imageUrl());
  }

  return {
    support_type: faker.random.arrayElement(support_type),
    contact_method: faker.random.arrayElement(contact_method),
    status: faker.random.arrayElement(status),
    message: faker.lorem.paragraphs(),
    attachments,
    email: faker.internet.email(),
    whatsapp: faker.phone.phoneNumber(),
    farm_id,
  };
}

async function supportTicketFactory({
  promisedUser = usersFactory(),
  promisedFarm = {},
} = {}, supportTicket = fakeSupportTicket()) {
  const [user, farm] = await Promise.all([promisedUser, promisedFarm]);
  const { user_id } = user;
  const { farm_id } = farm;
  const base = baseProperties(user_id);
  return knex('supportTicket').insert({
    farm_id, ...supportTicket, ...base,
    attachments: JSON.stringify(supportTicket.attachments),
  }).returning('*');
}

function fakeOrganicCertifierSurvey(farm_id) {
  const survey = ['COABC', faker.lorem.word()];
  const past = faker.date.past();
  const now = new Date();
  return {
    certifiers: faker.random.arrayElements(survey),
    created_at: past,
    updated_at: faker.date.between(past, now),
    interested: faker.random.boolean(),
    farm_id,
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

async function organicCertifierSurveyFactory({ promisedUserFarm = userFarmFactory() } = {}, organicCertifierSurvey = fakeOrganicCertifierSurvey()) {
  const [userFarm] = await Promise.all([promisedUserFarm]);
  const [{ farm_id, user_id }] = userFarm;
  return knex('organicCertifierSurvey').insert({
    ...organicCertifierSurvey,
    farm_id,
    created_by_user_id: user_id,
    updated_by_user_id: user_id,
    certifiers: JSON.stringify(organicCertifierSurvey.certifiers),
  }).returning('*');
}

async function barnFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
  promisedArea = areaFactory({ promisedLocation },
    fakeArea(), 'barn'),
} = {}, barn = fakeBarn()) {
  const [location] = await Promise.all([promisedLocation, promisedArea]);
  const [{ location_id }] = location;
  return knex('barn').insert({ location_id, ...barn }).returning('*');
}

function fakeBarn() {
  return {
    wash_and_pack: faker.random.boolean(),
    cold_storage: faker.random.boolean(),
  };
}

async function greenhouseFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
  promisedArea = areaFactory({ promisedLocation },
    fakeArea(), 'greenhouse'),
} = {}, greenhouse = fakeGreenhouse()) {
  const [location] = await Promise.all([promisedLocation, promisedArea]);
  const [{ location_id }] = location;
  return knex('greenhouse').insert({ location_id, ...greenhouse }).returning('*');
}


function fakeGreenhouse() {
  return {
    organic_status: faker.random.arrayElement(['Non-Organic', 'Transitional', 'Organic']),
  };
}

async function watercourseFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}, watercourse = fakeWatercourse()) {
  const [location] = await Promise.all([promisedLocation]);
  const [{ location_id }] = location;
  await lineFactory({ promisedLocation: location }, fakeLine(), 'watercourse');
  return knex('watercourse').insert({ location_id, ...watercourse }).returning('*');
}

function fakeWatercourse() {
  return {
    used_for_irrigation: faker.random.boolean(),
    buffer_width: faker.random.number(),
  };
}

async function water_valveFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
  promisedPoint = pointFactory({ promisedLocation },
    fakePoint(), 'water_valve'),
} = {}, water_valve = fakeWaterValve()) {
  const [location] = await Promise.all([promisedLocation, promisedPoint]);
  const [{ location_id }] = location;
  return knex('water_valve').insert({ location_id, ...water_valve }).returning('*');
}

function fakeWaterValve() {
  return {
    source: faker.random.arrayElement(['Municipal water', 'Surface water', 'Groundwater', 'Rain water']),
    flow_rate_unit: faker.random.arrayElement(['l/min', 'l/h', 'gal/min', 'gal/h']),
    flow_rate: faker.random.number(1000),

  };
}

async function surface_waterFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
  promisedArea = areaFactory({ promisedLocation },
    fakeArea(), 'surface_water'),
} = {}, surface_water = fakeSurfaceWater()) {
  const [location] = await Promise.all([promisedLocation, promisedArea]);
  const [{ location_id }] = location;
  return knex('surface_water').insert({ location_id, ...surface_water }).returning('*');
}

function fakeSurfaceWater() {
  return {
    used_for_irrigation: faker.random.boolean(),
  };
}

async function pointFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}, point = fakePoint(), pointType) {
  const [location] = await Promise.all([promisedLocation]);
  const [{ location_id }] = location;
  const { type, ...realPoint } = point;
  const [{ figure_id }] = await figureFactory(location_id, pointType ? pointType : type);
  return knex('point').insert({ figure_id, ...realPoint }).returning('*');
}

async function baseArea({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
  promisedArea = areaFactory({ promisedLocation },
    fakeArea()),
} = {}, asset) {
  const [location, area] = await Promise.all([promisedLocation, promisedArea]);
  const [{ location_id }] = location;
  return knex(asset).insert({ location_id }).returning('*');
}

async function natural_areaFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}) {
  return await baseArea({ promisedLocation }, 'natural_area');
}

async function ceremonial_areaFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}) {
  return await baseArea({ promisedLocation }, 'ceremonial_area');
}

async function residenceFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}) {
  return await baseArea({ promisedLocation }, 'residence');
}

async function farm_site_boundaryFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
} = {}) {
  return await baseArea({ promisedLocation }, 'farm_site_boundary');
}

async function buffer_zoneFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
  promisedLine = lineFactory({ promisedLocation },
    fakeLine()),
} = {}){
  const [location] = await Promise.all([promisedLocation, promisedLine]);
  const [{ location_id }] = location;
  return knex('buffer_zone').insert({ location_id }).returning('*');
}

async function gateFactory({
  promisedFarm = farmFactory(),
  promisedLocation = locationFactory({ promisedFarm }),
  promisedPoint = pointFactory({ promisedLocation }, fakePoint()),
} = {}) {
  const [location] = await Promise.all([promisedLocation, promisedPoint]);
  const [{ location_id }] = location;
  return knex('gate').insert({ location_id }).returning('*');
}


function fakePoint() {
  return {
    point: {
      lat: Number(faker.address.latitude()),
      lng: Number(faker.address.longitude()),
    },
  };
}


module.exports = {
  weather_stationFactory, fakeStation,
  usersFactory, fakeUser,
  fakeSSOUser,
  farmFactory, fakeFarm,
  userFarmFactory, fakeUserFarm,
  fieldFactory, fakeField,
  gardenFactory, fakeGarden,
  cropFactory, fakeCrop,
  fieldCropFactory, fakeFieldCrop,
  fertilizerFactory, fakeFertilizer,
  activityLogFactory, fakeActivityLog,
  harvestUseTypeFactory, fakeHarvestUseType,
  createDefaultState,
  harvestUseFactory, fakeHarvestUse,
  fertilizerLogFactory, fakeFertilizerLog,
  pesticideFactory, fakePesticide,
  diseaseFactory, fakeDisease,
  pestControlLogFactory, fakePestControlLog,
  harvestLogFactory, fakeHarvestLog,
  seedLogFactory, fakeSeedLog,
  fieldWorkLogFactory, fakeFieldWorkLog,
  soilDataLogFactory, fakeSoilDataLog,
  irrigationLogFactory, fakeIrrigationLog,
  scoutingLogFactory, fakeScoutingLog,
  shiftFactory, fakeShift,
  shiftTaskFactory, fakeShiftTask,
  saleFactory, fakeSale,
  locationFactory, fakeLocation,
  fakeTaskType, taskTypeFactory,
  yieldFactory, fakeYield,
  priceFactory, fakePrice,
  fakeWaterBalance,
  fakeCropSale, cropSaleFactory,
  farmExpenseTypeFactory, fakeExpenseType,
  farmExpenseFactory, fakeExpense,
  fakeFieldForTests,
  fakeFence, fenceFactory,
  fakeArea, areaFactory,
  fakeLine, lineFactory,
  activityCropsFactory, activityFieldsFactory,
  fakeNitrogenSchedule, nitrogenScheduleFactory,
  fakeFarmDataSchedule, farmDataScheduleFactory,
  fakePriceInsightForTests,
  fakeOrganicCertifierSurvey, organicCertifierSurveyFactory,
  fakeSupportTicket, supportTicketFactory,
  fakePoint, pointFactory,
  fakeSurfaceWater, surface_waterFactory,
  fakeBarn, barnFactory,
  fakeWaterValve, water_valveFactory,
  fakeWatercourse, watercourseFactory,
  fakeGreenhouse, greenhouseFactory,
  natural_areaFactory,
  ceremonial_areaFactory,
  farm_site_boundaryFactory,
  residenceFactory,
  buffer_zoneFactory,
  gateFactory,
};
