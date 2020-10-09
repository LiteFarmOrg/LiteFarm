const Knex = require('knex')
const environment = process.env.TEAMCITY_DOCKER_NETWORK ? 'pipeline' : 'test';
const config = require('../knexfile')[environment];
let faker = require('faker');
const knex = Knex(config);

function weather_stationFactory(station = fakeStation()) {
  return knex('weather_station').insert(station).returning('*');
}

function fakeStation() {
  return {
    id: faker.random.number(0x7FFFFFFF),
    name: faker.address.country(),
    country: faker.address.countryCode(),
    timezone: faker.random.number(1000),
  }
}

function usersFactory(userObject = fakeUser()) {
  return knex('users').insert(userObject).returning('*');
}

function fakeUser() {
  return {
    first_name: faker.name.findName(),
    last_name: faker.name.lastName(),
    email: faker.lorem.word() + faker.internet.email(),
    user_id: faker.random.uuid(),
  }
}

function farmFactory(farmObject = fakeFarm()) {
  return knex('farm').insert(farmObject).returning('*');
}

function fakeFarm() {
  return {
    farm_name: faker.company.companyName(),
    address: faker.address.streetAddress(),
    grid_points: {
      lat: faker.address.latitude(),
      lng: faker.address.longitude(),
    },
  }
}

async function userFarmFactory({ promisedUser = usersFactory(), promisedFarm = farmFactory() } = {}, userFarm = fakeUserFarm()) {
  const [user, farm] = await Promise.all([promisedUser, promisedFarm]);
  const [{ user_id }] = user;
  const [{ farm_id }] = farm;
  return knex('userFarm').insert({ user_id, farm_id, ...userFarm }).returning('*');
}

function fakeUserFarm() {
  return {
    role_id: faker.random.arrayElement([1, 2, 3]),
    status: 'Active',
    has_consent: true,
  }
}

async function farmDataScheduleFactory({ promisedUser = usersFactory(), promisedFarm = farmFactory() } = {}, farmDataSchedule = fakeFarmDataSchedule()) {
  const [user, farm] = await Promise.all([promisedUser, promisedFarm]);
  const [{ user_id }] = user;
  const [{ farm_id }] = farm;
  return knex('farmDataSchedule').insert({ user_id, farm_id, ...farmDataSchedule }).returning('*');
}

function fakeFarmDataSchedule() {
  return {
    has_failed: false,
  }
}

async function fieldFactory({ promisedStation = weather_stationFactory(), promisedFarm = farmFactory() } = {}, field = fakeField()) {
  const [station, farm] = await Promise.all([promisedStation, promisedFarm]);
  const [{ station_id }] = station;
  const [{ farm_id }] = farm;
  return knex('field').insert({ station_id, farm_id, ...field }).returning('*');
}


function fakeField() {
  return {
    field_name: faker.random.arrayElement(['Test Field', 'Awesome Field', 'Nice Field']),
    area: faker.random.number(2000),
    grid_points: JSON.stringify([{
      lat: faker.address.latitude(),
      lng: faker.address.longitude(),
    }]),
  }
}

function fakeFieldForTests() {
  return {
    ...fakeField(), grid_points: [{
      lat: faker.address.latitude(),
      lng: faker.address.longitude(),
    }],
  }
}

function fakePriceInsightForTests() {
  return {
    distance: faker.random.arrayElement([5, 10, 25, 50]),
    lat: faker.address.latitude(),
    long: faker.address.latitude(),
    startdate: faker.date.future(),
  }
}

async function cropFactory({ promisedFarm = farmFactory() } = {}, crop = fakeCrop()) {
  const [farm] = await Promise.all([promisedFarm]);
  const [{ farm_id }] = farm;
  return knex('crop').insert({ farm_id, ...crop }).returning('*');
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
  const [farm] = await Promise.all([promisedFarm]);
  const [{ farm_id }] = farm;
  return knex('farmExpenseType').insert({ farm_id, ...expense_type }).returning('*');
}

async function farmExpenseFactory({ promisedExpenseType = farmExpenseTypeFactory() } = {}, expense = fakeExpense()) {
  const [expense_type] = await Promise.all([promisedExpenseType]);
  const [{ expense_type_id }] = expense_type;
  const [{ farm_id }] = expense_type;
  return knex('farmExpense').insert({ expense_type_id, farm_id, ...expense }).returning('*');
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
  }
}

function fakeYield() {
  return {
    yield_id: faker.random.number(0x7FFFFFFF),
    'quantity_kg/m2': faker.random.number(10),
    date: faker.date.future(),
  }
}

function fakePrice() {
  return {
    price_id: faker.random.number(0x7FFFFFFF),
    'value_$/kg': faker.random.number(100),
    date: faker.date.future(),
  }
}

function fakeExpense() {
  return {
    expense_date: faker.date.future(),
    value: faker.random.number(100),
    note: faker.helpers.randomize()
  }
}

async function fieldCropFactory({ promisedField = fieldFactory(), promisedCrop = cropFactory() } = {}, fieldCrop = fakeFieldCrop()) {
  const [field, crop] = await Promise.all([promisedField, promisedCrop]);
  const [{ field_id }] = field;
  const [{ crop_id }] = crop;
  return knex('fieldCrop').insert({ field_id, crop_id, ...fieldCrop }).returning('*');

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
  }
}

async function fertilizerFactory({ promisedFarm = farmFactory() } = {}, fertilizer = fakeFertilizer()) {
  const [farm] = await Promise.all([promisedFarm]);
  const [{ farm_id }] = farm;
  return knex('fertilizer').insert({ farm_id, ...fertilizer }).returning('*');
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
  }
}

async function activityLogFactory({ promisedUser = usersFactory() } = {}, activityLog = fakeActivityLog()) {
  const [user] = await Promise.all([promisedUser]);
  const [{ user_id }] = user;
  return knex('activityLog').insert({ user_id, ...activityLog }).returning('*');

}

function fakeActivityLog() {
  return {
    activity_kind: faker.random.arrayElement(['fertilizing', 'pestControl', 'scouting', 'irrigation', 'harvest',
      'seeding', 'fieldWork', 'weatherData', 'soilData', 'other']),
    date: faker.date.future(),
    notes: faker.lorem.words(),
  }
}

async function fertilizerLogFactory({
  promisedActivityLog = activityLogFactory(),
  promisedFertilizer = fertilizerFactory(),
} = {}, fertilizerLog = fakeFertilizerLog()) {
  const [activityLog, fertilizer] = await Promise.all([promisedActivityLog, promisedFertilizer]);
  const [{ activity_id }] = activityLog;
  const [{ fertilizer_id }] = fertilizer;
  return knex('fertilizerLog').insert({ activity_id, fertilizer_id, ...fertilizerLog }).returning('*')
}

function fakeFertilizerLog() {
  return { quantity_kg: faker.random.number(200) }

}

async function activityCropsFactory({
  promisedActivityLog = activityLogFactory(),
  promisedFieldCrop = fieldCropFactory(),
} = {}) {
  const [activityLog, fieldCrop] = await Promise.all([promisedActivityLog, promisedFieldCrop]);
  const [{ activity_id }] = activityLog;
  const [{ field_crop_id }] = fieldCrop;
  return knex('activityCrops').insert({ activity_id, field_crop_id }).returning('*')
}

async function activityFieldsFactory({
  promisedActivityLog = activityLogFactory(),
  promisedField = fieldFactory(),
} = {}) {
  const [activityLog, field] = await Promise.all([promisedActivityLog, promisedField]);
  const [{ activity_id }] = activityLog;
  const [{ field_id }] = field;
  return knex('activityFields').insert({ activity_id, field_id }).returning('*')
}

async function pesticideFactory({ promisedFarm = farmFactory() } = {}, pesticide = fakePesticide()) {
  const [farm] = await Promise.all([promisedFarm]);
  const [{ farm_id }] = farm;
  return knex('pesticide').insert({ farm_id, ...pesticide }).returning('*');
}

function fakePesticide() {
  return {
    pesticide_name: faker.lorem.word(),
    entry_interval: faker.random.number(20),
    harvest_interval: faker.random.number(20),
    active_ingredients: faker.lorem.words(),
    concentration: faker.random.number(3000),
  }
}

function fakeTaskType() {
  return {
    task_name: faker.lorem.word(),
  }
}

async function taskTypeFactory({ promisedFarm = farmFactory() } = {}, taskType = fakeTaskType()) {
  const [farm] = await Promise.all([promisedFarm]);
  const [{ farm_id }] = farm;
  return knex('taskType').insert({ farm_id, ...taskType }).returning('*');
}

async function diseaseFactory({ promisedFarm = farmFactory() } = {}, disease = fakeDisease()) {
  const [farm] = await Promise.all([promisedFarm]);
  const [{ farm_id }] = farm;
  return knex('disease').insert({ farm_id, ...disease }).returning('*');
}

function fakeDisease() {
  return {
    disease_scientific_name: faker.lorem.words(),
    disease_common_name: faker.lorem.words(),
    disease_group: faker.random.arrayElement(['Fungus', 'Insect', 'Bacteria', 'Virus', 'Deficiency', 'Mite', 'Other', 'Weed']),
  }
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
  }
}

async function harvestLogFactory({ promisedActivity = activityLogFactory() } = {}, harvestLog = fakeHarvestLog()) {
  const [activity] = await Promise.all([promisedActivity]);
  const [{ activity_id }] = activity;
  return knex('harvestLog').insert({ activity_id, ...harvestLog }).returning('*');
}

function fakeHarvestLog() {
  return {
    quantity_kg: faker.random.number(1000),
  }
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
  }
}

async function fieldWorkLogFactory({ promisedActivity = activityLogFactory() } = {}, fieldWorkLog = fakeFieldWorkLog()) {
  const [activity] = await Promise.all([promisedActivity]);
  const [{ activity_id }] = activity;
  return knex('fieldWorkLog').insert({ activity_id, ...fieldWorkLog }).returning('*');
}

function fakeFieldWorkLog() {
  return {
    type: faker.random.arrayElement(['plow', 'ridgeTill', 'zoneTill', 'mulchTill', 'ripping', 'discing']),
  }
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
  }
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
  }
}

async function scoutingLogFactory({ promisedActivity = activityLogFactory() } = {}, scoutingLog = fakeScoutingLog()) {
  const [activity] = await Promise.all([promisedActivity]);
  const [{ activity_id }] = activity;
  return knex('scoutingLog').insert({ activity_id, ...scoutingLog }).returning('*');
}

function fakeScoutingLog() {
  return {
    type: faker.random.arrayElement(['harvest', 'pest', 'disease', 'weed', 'other']),
  }
}

async function shiftFactory({ promisedUserFarm = userFarmFactory() } = {}, shift = fakeShift()) {
  const [userFarm] = await Promise.all([promisedUserFarm]);
  const [{ user_id, farm_id }] = userFarm;
  return knex('shift').insert({ user_id, farm_id, ...shift }).returning('*');
}

function fakeShift() {
  return {
    start_time: faker.date.past(),
    end_time: faker.date.future(),
    break_duration: faker.random.number(10),
    mood: faker.random.arrayElement(['happy', 'neutral', 'very happy', 'sad', 'very sad', 'na']),
    wage_at_moment: faker.random.number(20),
  }
}

async function shiftTaskFactory({
  promisedShift = shiftFactory(),
  promisedFieldCrop = fieldCropFactory(), promisedField = fieldFactory(),
  promisedTaskType = taskTypeFactory(),
} = {}, shiftTask = fakeShiftTask()) {
  const [shift, fieldCrop, field, task] = await Promise.all([promisedShift, promisedFieldCrop, promisedField, promisedTaskType]);
  const [{ shift_id }] = shift;
  const [{ field_crop_id }] = fieldCrop;
  const [{ field_id }] = field;
  const [{ task_id }] = task;
  return knex('shiftTask').insert({ shift_id, field_id, field_crop_id, task_id, ...shiftTask }).returning('*');
}

function fakeShiftTask() {
  return {
    is_field: faker.random.boolean(),
    duration: faker.random.number(200),
  }
}

async function saleFactory({ promisedFarm = farmFactory() } = {}, sale = fakeSale()) {
  const [farm] = await Promise.all([promisedFarm]);
  const [{ farm_id }] = farm;
  return knex('sale').insert({ farm_id, ...sale }).returning('*');
}


function fakeSale() {
  return {
    customer_name: faker.name.findName(),
    sale_date: faker.date.recent(),
  }
}

function fakeExpenseType() {
  return {
    expense_name: faker.finance.transactionType()
  }
}

function fakeWaterBalance() {
  return {
    created_at: faker.date.future(),
    soil_water: faker.random.number(2000),
    plant_available_water: faker.random.number(2000),
  }
}

async function waterBalanceFactory({ promisedFieldCrop = fieldCropFactory() } = {}, waterBalance = fakeWaterBalance()) {
  const [fieldCrop] = await Promise.all([promisedFieldCrop]);
  const [{ field_id, crop_id }] = fieldCrop;
  return knex('waterBalance').insert({ field_id, crop_id, ...waterBalance }).returning('*');
}

function fakeNitrogenSchedule() {
  return {
    created_at: faker.date.past(),
    scheduled_at: faker.date.future(),
    frequency: faker.random.number(10),
  }
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
  }
}

async function cropSaleFactory({ promisedFieldCrop = fieldCropFactory(), promisedSale = saleFactory() } = {}, cropSale = fakeCropSale()) {
  const [fieldCrop, sale] = await Promise.all([promisedFieldCrop, promisedSale]);
  const [{ crop_id, field_crop_id }] = fieldCrop;
  const [{ sale_id }] = sale;
  return knex('cropSale').insert({ crop_id, field_crop_id, sale_id, ...cropSale }).returning('*');
}

module.exports = {
  weather_stationFactory, fakeStation,
  usersFactory, fakeUser,
  farmFactory, fakeFarm,
  userFarmFactory, fakeUserFarm,
  fieldFactory, fakeField,
  cropFactory, fakeCrop,
  fieldCropFactory, fakeFieldCrop,
  fertilizerFactory, fakeFertilizer,
  activityLogFactory, fakeActivityLog,
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
  fakeTaskType, taskTypeFactory,
  yieldFactory, fakeYield,
  priceFactory, fakePrice,
  fakeWaterBalance, waterBalanceFactory,
  fakeCropSale, cropSaleFactory,
  farmExpenseTypeFactory, fakeExpenseType,
  farmExpenseFactory, fakeExpense,
  fakeFieldForTests,
  activityCropsFactory, activityFieldsFactory,
  fakeNitrogenSchedule, nitrogenScheduleFactory,
  fakeFarmDataSchedule, farmDataScheduleFactory,
  fakePriceInsightForTests
}
