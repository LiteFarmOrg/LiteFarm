// constants for crop groups and subgroups
const CROP_GROUPS = [
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
CROP_GROUPS.sort();

const CROP_SUBGROUPS = [
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
CROP_SUBGROUPS.sort();
//FIXME: crop v2 update
export const CROP_DICT = {
  'Fruit and nuts': [
    'Nuts',
    'Pome fruits and stone fruits',
    'Tropical and subtropical fruits',
    'Citrus fruits',
    'Berries',
    'Grapes',
    'Other fruits',
    'Mushrooms and truffles',
  ],
  'Beverage and spice crops': ['Temporary spice crops', 'Permanent spice crops'],
  'Potatoes and yams': [],
  'Vegetables and melons': [
    'High starch Root/tuber crops',
    'Leafy or stem vegetables',
    'Fruit-bearing vegetables',
    'Root, bulb, or tuberous vegetables',
  ],
  Cereals: ['Cereals'],
  'Leguminous crops': ['Legumes'],
  'Sugar crops': ['Sugar crops (root)', 'Sugar crops (other)'],
  'Oilseed crops': ['Temporary oilseed crops', 'Permanent oilseed crops'],
  'Other crops': [
    'Other crops',
    'Fibre crops',
    'Grasses and other fodder crops',
    'Medicinal, aromatic, pesticidal, or similar crops',
    'Flower crops',
    'Rubber',
    'Tobacco',
  ],
};

const FRUITS_AND_NUTS = 'Fruit and nuts';
const OTHER_CROPS = 'Other crops';
const STIMULANT_SPICE_AROMATIC_CROPS = 'Stimulant, spice and aromatic crops';
const VEGETABLE_AND_MELONS = 'Vegetables and melons';
const CEREALS = 'Cereals';
const HIGH_STARCH_ROOT_TUBER_CROP = 'High starch root/tuber crops';
const OILSEED_CROPS = 'Oilseed crops and oleaginous fruits';
const LEGUMINOUS_CROPS = 'Leguminous crops';
const SUGAR_CROPS = 'Sugar crops';
const POTATOES_AND_YAMS = 'Potatoes and yams';
const BEVERAGE_AND_SPICE_CROPS = 'Beverage and spice crops';

const NUTRIENT_DICT = {
  initial_kc: 'INIT_KC',
  mid_kc: 'MID_KC',
  end_kc: 'END_KC',
  max_height: 'MAX_HEIGHT',
  protein: 'PROTEIN',
  lipid: 'LIPID',
  energy: 'ENERGY',
  ca: 'CALCIUM',
  fe: 'IRON',
  mg: 'MAGNESIUM',
  ph: 'PH',
  k: 'K',
  na: 'NA',
  zn: 'ZINC',
  cu: 'COPPER',
  mn: 'MANGANESE',
  vita_rae: 'VITA_RAE',
  vitc: 'VITAMIN_C',
  thiamin: 'THIAMIN',
  riboflavin: 'RIBOFLAVIN',
  niacin: 'NIACIN',
  vitb6: 'VITAMIN_B6',
  folate: 'FOLATE',
  vitb12: 'VITAMIN_B12',
  max_rooting_depth: 'MAX_ROOTING',
  nutrient_credits: 'NUTRIENT_CREDITS',
};

const FIRST_NUTRIENT_ARRAY = ['initial_kc', 'mid_kc', 'end_kc', 'max_height', 'max_rooting_depth'];

const SECOND_NUTRIENT_ARRAY = [
  'protein',
  'lipid',
  'ph',
  'energy',
  'ca',
  'fe',
  'mg',
  'k',
  'na',
  'zn',
  'cu',
  'mn',
  'vita_rae',
  'vitc',
  'thiamin',
  'riboflavin',
  'niacin',
  'vitb6',
  'folate',
  'vitb12',
  'nutrient_credits',
];

const NUTRIENT_ARRAY = FIRST_NUTRIENT_ARRAY.concat(SECOND_NUTRIENT_ARRAY);

export {
  CROP_GROUPS,
  CROP_SUBGROUPS,
  NUTRIENT_DICT,
  FIRST_NUTRIENT_ARRAY,
  SECOND_NUTRIENT_ARRAY,
  NUTRIENT_ARRAY,
  BEVERAGE_AND_SPICE_CROPS,
  CEREALS,
  FRUITS_AND_NUTS,
  LEGUMINOUS_CROPS,
  OILSEED_CROPS,
  OTHER_CROPS,
  POTATOES_AND_YAMS,
  SUGAR_CROPS,
  VEGETABLE_AND_MELONS,
  STIMULANT_SPICE_AROMATIC_CROPS,
  HIGH_STARCH_ROOT_TUBER_CROP,
};
