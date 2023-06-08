import React from 'react';
import { within, userEvent } from '@storybook/testing-library';
import decorators from '../../config/Decorators';
import { chromaticSmallScreen } from '../../config/chromatic';
import PureTaskDetails from '../../../../components/Task/PureTaskDetails';
import UnitTest from '../../../../test-utils/storybook/unit';
import { harvestAmounts } from '../../../../util/convert-units/unit';

export default {
  title: 'Page/AddCleaningTask',
  decorators: decorators,
  component: PureTaskDetails,
};

const Template = (args) => <PureTaskDetails {...args} />;

const managementPlansByLocationIds = {
  '6caeac92-73b6-11ed-ac0f-7bd8b506ce4c': [
    {
      crop_common_name: 'Abiu',
      crop_genus: 'Pouteria',
      crop_group: 'Fruit and nuts',
      crop_id: 168,
      crop_photo_url: 'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/abiu.webp',
      crop_specie: 'caimito',
      crop_subgroup: 'Tropical and subtropical fruits',
      crop_translation_key: 'ABIU',
      farm_id: '8350e6e6-7216-11ed-b431-2792462c3cd9',
      can_be_cover_crop: false,
      planting_depth: 0.01,
      yield_per_area: 2.1,
      average_seed_weight: 0.0085,
      yield_per_plant: 77,
      lifecycle: 'PERENNIAL',
      seeding_type: 'SEED',
      needs_transplant: false,
      germination_days: 15,
      transplant_days: 180,
      harvest_days: 1460,
      termination_days: null,
      planting_method: 'ROW_METHOD',
      plant_spacing: null,
      seeding_rate: null,
      hs_code_id: '8109099',
      crop_variety_id: '5a3fd31a-73b6-11ed-ac0f-7bd8b506ce4c',
      crop_variety_name: 'a',
      supplier: '',
      compliance_file_url: '',
      organic: null,
      treated: null,
      genetically_engineered: null,
      searched: null,
      protein: null,
      lipid: null,
      ph: null,
      energy: null,
      ca: null,
      fe: null,
      mg: null,
      k: null,
      na: null,
      zn: null,
      cu: null,
      mn: null,
      vita_rae: null,
      vitc: null,
      thiamin: null,
      riboflavin: null,
      niacin: null,
      vitb6: null,
      folate: null,
      vitb12: null,
      nutrient_credits: null,
      crop_variety_photo_url:
        'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/abiu.webp',
      crop: {
        crop_common_name: 'Abiu',
        crop_genus: 'Pouteria',
        crop_group: 'Fruit and nuts',
        crop_id: 168,
        crop_photo_url:
          'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/abiu.webp',
        crop_specie: 'caimito',
        crop_subgroup: 'Tropical and subtropical fruits',
        crop_translation_key: 'ABIU',
        farm_id: null,
        can_be_cover_crop: false,
        planting_depth: 0.01,
        yield_per_area: 2.1,
        average_seed_weight: 0.0085,
        yield_per_plant: 77,
        lifecycle: 'PERENNIAL',
        seeding_type: 'SEED',
        needs_transplant: true,
        germination_days: 15,
        transplant_days: 180,
        harvest_days: 1460,
        termination_days: null,
        planting_method: 'ROW_METHOD',
        plant_spacing: null,
        seeding_rate: null,
        hs_code_id: '8109099',
      },
      management_plan_id: 1,
      notes: '',
      name: 'Plan 1',
      start_date: null,
      complete_date: null,
      abandon_date: null,
      complete_notes: null,
      abandon_reason: null,
      already_in_ground: false,
      for_cover: false,
      germination_date: '2023-01-08T00:00:00.000',
      harvest_date: '2026-12-23T00:00:00.000',
      is_seed: true,
      seed_date: '2022-12-24T00:00:00.000',
      estimated_yield_unit: 'kg',
      estimated_yield: 462,
      estimated_revenue: null,
      is_wild: null,
      plant_date: null,
      termination_date: null,
      transplant_date: null,
      estimated_price_per_mass: null,
      estimated_price_per_mass_unit: 'kg',
      crop_management_plan: {
        already_in_ground: false,
        for_cover: false,
        germination_date: '2023-01-08T00:00:00.000',
        harvest_date: '2026-12-23T00:00:00.000',
        is_seed: true,
        management_plan_id: 1,
        needs_transplant: false,
        seed_date: '2022-12-24T00:00:00.000',
        estimated_yield_unit: 'kg',
        estimated_yield: 462,
        estimated_revenue: null,
        is_wild: null,
        plant_date: null,
        termination_date: null,
        transplant_date: null,
        estimated_price_per_mass: null,
        estimated_price_per_mass_unit: 'kg',
      },
      crop_variety: {
        crop_common_name: 'Abiu',
        crop_genus: 'Pouteria',
        crop_group: 'Fruit and nuts',
        crop_id: 168,
        crop_photo_url:
          'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/abiu.webp',
        crop_specie: 'caimito',
        crop_subgroup: 'Tropical and subtropical fruits',
        crop_translation_key: 'ABIU',
        farm_id: '8350e6e6-7216-11ed-b431-2792462c3cd9',
        can_be_cover_crop: false,
        planting_depth: 0.01,
        yield_per_area: 2.1,
        average_seed_weight: 0.0085,
        yield_per_plant: 77,
        lifecycle: 'PERENNIAL',
        seeding_type: 'SEED',
        needs_transplant: true,
        germination_days: 15,
        transplant_days: 180,
        harvest_days: 1460,
        termination_days: null,
        planting_method: 'ROW_METHOD',
        plant_spacing: null,
        seeding_rate: null,
        hs_code_id: '8109099',
        crop_variety_id: '5a3fd31a-73b6-11ed-ac0f-7bd8b506ce4c',
        crop_variety_name: 'a',
        supplier: '',
        compliance_file_url: '',
        organic: null,
        treated: null,
        genetically_engineered: null,
        searched: null,
        protein: null,
        lipid: null,
        ph: null,
        energy: null,
        ca: null,
        fe: null,
        mg: null,
        k: null,
        na: null,
        zn: null,
        cu: null,
        mn: null,
        vita_rae: null,
        vitc: null,
        thiamin: null,
        riboflavin: null,
        niacin: null,
        vitb6: null,
        folate: null,
        vitb12: null,
        nutrient_credits: null,
        crop_variety_photo_url:
          'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/abiu.webp',
        crop: {
          crop_common_name: 'Abiu',
          crop_genus: 'Pouteria',
          crop_group: 'Fruit and nuts',
          crop_id: 168,
          crop_photo_url:
            'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/abiu.webp',
          crop_specie: 'caimito',
          crop_subgroup: 'Tropical and subtropical fruits',
          crop_translation_key: 'ABIU',
          farm_id: null,
          can_be_cover_crop: false,
          planting_depth: 0.01,
          yield_per_area: 2.1,
          average_seed_weight: 0.0085,
          yield_per_plant: 77,
          lifecycle: 'PERENNIAL',
          seeding_type: 'SEED',
          needs_transplant: true,
          germination_days: 15,
          transplant_days: 180,
          harvest_days: 1460,
          termination_days: null,
          planting_method: 'ROW_METHOD',
          plant_spacing: null,
          seeding_rate: null,
          hs_code_id: '8109099',
        },
      },
      location: {
        farm_id: '8350e6e6-7216-11ed-b431-2792462c3cd9',
        name: 'field2',
        notes: '',
        location_id: '6caeac92-73b6-11ed-ac0f-7bd8b506ce4c',
        figure_id: '6caeac93-73b6-11ed-ac0f-7bd8b506ce4c',
        type: 'field',
        total_area: 2260,
        total_area_unit: 'ha',
        grid_points: [
          {
            lat: 49.26734670912297,
            lng: -123.16660760290222,
          },
          {
            lat: 49.266772632696394,
            lng: -123.16702066309051,
          },
          {
            lat: 49.26677613318264,
            lng: -123.16604433900909,
          },
        ],
        perimeter: 217,
        perimeter_unit: 'm',
        organic_status: 'Non-Organic',
        deleted: false,
        station_id: null,
        transition_date: null,
      },
      planting_management_plan: {
        estimated_seeds: 0.051,
        estimated_seeds_unit: 'kg',
        is_final_planting_management_plan: true,
        location_id: '6caeac92-73b6-11ed-ac0f-7bd8b506ce4c',
        management_plan_id: 1,
        planting_management_plan_id: '4d2c07db-09f9-41bc-8a62-647a38d2e944',
        planting_method: 'CONTAINER_METHOD',
        is_planting_method_known: null,
        notes: null,
        pin_coordinate: null,
        container_method: {
          in_ground: false,
          number_of_containers: 3,
          planting_depth: 0.01,
          planting_depth_unit: 'cm',
          planting_management_plan_id: '4d2c07db-09f9-41bc-8a62-647a38d2e944',
          planting_soil: '4',
          plants_per_container: 2,
          container_type: null,
          plant_spacing: null,
          plant_spacing_unit: 'cm',
          total_plants: null,
        },
        location: {
          farm_id: '8350e6e6-7216-11ed-b431-2792462c3cd9',
          name: 'field2',
          notes: '',
          location_id: '6caeac92-73b6-11ed-ac0f-7bd8b506ce4c',
          figure_id: '6caeac93-73b6-11ed-ac0f-7bd8b506ce4c',
          type: 'field',
          total_area: 2260,
          total_area_unit: 'ha',
          grid_points: [
            {
              lat: 49.26734670912297,
              lng: -123.16660760290222,
            },
            {
              lat: 49.266772632696394,
              lng: -123.16702066309051,
            },
            {
              lat: 49.26677613318264,
              lng: -123.16604433900909,
            },
          ],
          perimeter: 217,
          perimeter_unit: 'm',
          organic_status: 'Non-Organic',
          deleted: false,
          station_id: null,
          transition_date: null,
        },
      },
      firstTaskDate: '2022-12-24T00:00:00.000',
      status: 'planned',
    },
  ],
  '7ef87edc-73b6-11ed-ac0f-7bd8b506ce4c': [
    {
      crop_common_name: 'Achacha',
      crop_genus: 'Garcinia',
      crop_group: 'Fruit and nuts',
      crop_id: 170,
      crop_photo_url:
        'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/achacha.webp',
      crop_specie: 'humilis',
      crop_subgroup: 'Tropical and subtropical fruits',
      crop_translation_key: 'ACHACHA',
      farm_id: '8350e6e6-7216-11ed-b431-2792462c3cd9',
      can_be_cover_crop: false,
      planting_depth: null,
      yield_per_area: 0.01,
      average_seed_weight: null,
      yield_per_plant: null,
      lifecycle: 'PERENNIAL',
      seeding_type: 'SEED',
      needs_transplant: false,
      germination_days: null,
      transplant_days: null,
      harvest_days: 150,
      termination_days: null,
      planting_method: null,
      plant_spacing: null,
      seeding_rate: null,
      hs_code_id: '8109099',
      crop_variety_id: 'db76fc7a-73d3-11ed-ac0f-7bd8b506ce4c',
      crop_variety_name: '2',
      supplier: '',
      compliance_file_url: '',
      organic: null,
      treated: null,
      genetically_engineered: null,
      searched: null,
      protein: null,
      lipid: null,
      ph: null,
      energy: null,
      ca: null,
      fe: null,
      mg: null,
      k: null,
      na: null,
      zn: null,
      cu: null,
      mn: null,
      vita_rae: null,
      vitc: null,
      thiamin: null,
      riboflavin: null,
      niacin: null,
      vitb6: null,
      folate: null,
      vitb12: null,
      nutrient_credits: null,
      crop_variety_photo_url:
        'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/achacha.webp',
      crop: {
        crop_common_name: 'Achacha',
        crop_genus: 'Garcinia',
        crop_group: 'Fruit and nuts',
        crop_id: 170,
        crop_photo_url:
          'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/achacha.webp',
        crop_specie: 'humilis',
        crop_subgroup: 'Tropical and subtropical fruits',
        crop_translation_key: 'ACHACHA',
        farm_id: null,
        can_be_cover_crop: false,
        planting_depth: null,
        yield_per_area: 0.01,
        average_seed_weight: null,
        yield_per_plant: null,
        lifecycle: 'PERENNIAL',
        seeding_type: 'SEED',
        needs_transplant: true,
        germination_days: null,
        transplant_days: null,
        harvest_days: 150,
        termination_days: null,
        planting_method: null,
        plant_spacing: null,
        seeding_rate: null,
        hs_code_id: '8109099',
      },
      management_plan_id: 2,
      notes: '',
      name: 'Plan 1',
      start_date: '2022-12-01T00:00:00.000',
      complete_date: null,
      abandon_date: null,
      complete_notes: null,
      abandon_reason: null,
      already_in_ground: true,
      for_cover: false,
      harvest_date: '2022-12-24T00:00:00.000',
      is_wild: false,
      seed_date: '2022-12-01T00:00:00.000',
      estimated_yield_unit: 'kg',
      estimated_revenue: null,
      germination_date: null,
      is_seed: null,
      plant_date: null,
      termination_date: null,
      transplant_date: null,
      estimated_yield: null,
      estimated_price_per_mass: null,
      estimated_price_per_mass_unit: 'kg',
      crop_management_plan: {
        already_in_ground: true,
        for_cover: false,
        harvest_date: '2022-12-24T00:00:00.000',
        is_wild: false,
        management_plan_id: 2,
        needs_transplant: false,
        seed_date: '2022-12-01T00:00:00.000',
        estimated_yield_unit: 'kg',
        estimated_revenue: null,
        germination_date: null,
        is_seed: null,
        plant_date: null,
        termination_date: null,
        transplant_date: null,
        estimated_yield: null,
        estimated_price_per_mass: null,
        estimated_price_per_mass_unit: 'kg',
      },
      crop_variety: {
        crop_common_name: 'Achacha',
        crop_genus: 'Garcinia',
        crop_group: 'Fruit and nuts',
        crop_id: 170,
        crop_photo_url:
          'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/achacha.webp',
        crop_specie: 'humilis',
        crop_subgroup: 'Tropical and subtropical fruits',
        crop_translation_key: 'ACHACHA',
        farm_id: '8350e6e6-7216-11ed-b431-2792462c3cd9',
        can_be_cover_crop: false,
        planting_depth: null,
        yield_per_area: 0.01,
        average_seed_weight: null,
        yield_per_plant: null,
        lifecycle: 'PERENNIAL',
        seeding_type: 'SEED',
        needs_transplant: true,
        germination_days: null,
        transplant_days: null,
        harvest_days: 150,
        termination_days: null,
        planting_method: null,
        plant_spacing: null,
        seeding_rate: null,
        hs_code_id: '8109099',
        crop_variety_id: 'db76fc7a-73d3-11ed-ac0f-7bd8b506ce4c',
        crop_variety_name: '2',
        supplier: '',
        compliance_file_url: '',
        organic: null,
        treated: null,
        genetically_engineered: null,
        searched: null,
        protein: null,
        lipid: null,
        ph: null,
        energy: null,
        ca: null,
        fe: null,
        mg: null,
        k: null,
        na: null,
        zn: null,
        cu: null,
        mn: null,
        vita_rae: null,
        vitc: null,
        thiamin: null,
        riboflavin: null,
        niacin: null,
        vitb6: null,
        folate: null,
        vitb12: null,
        nutrient_credits: null,
        crop_variety_photo_url:
          'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/achacha.webp',
        crop: {
          crop_common_name: 'Achacha',
          crop_genus: 'Garcinia',
          crop_group: 'Fruit and nuts',
          crop_id: 170,
          crop_photo_url:
            'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/achacha.webp',
          crop_specie: 'humilis',
          crop_subgroup: 'Tropical and subtropical fruits',
          crop_translation_key: 'ACHACHA',
          farm_id: null,
          can_be_cover_crop: false,
          planting_depth: null,
          yield_per_area: 0.01,
          average_seed_weight: null,
          yield_per_plant: null,
          lifecycle: 'PERENNIAL',
          seeding_type: 'SEED',
          needs_transplant: true,
          germination_days: null,
          transplant_days: null,
          harvest_days: 150,
          termination_days: null,
          planting_method: null,
          plant_spacing: null,
          seeding_rate: null,
          hs_code_id: '8109099',
        },
      },
      pin_coordinate: null,
      location: {
        farm_id: '8350e6e6-7216-11ed-b431-2792462c3cd9',
        name: 'field',
        notes: '',
        location_id: '7ef87edc-73b6-11ed-ac0f-7bd8b506ce4c',
        figure_id: '7ef87edd-73b6-11ed-ac0f-7bd8b506ce4c',
        type: 'field',
        total_area: 1305,
        total_area_unit: 'ha',
        grid_points: [
          {
            lat: 49.267017666134535,
            lng: -123.16514311678009,
          },
          {
            lat: 49.26669912242765,
            lng: -123.16553471929626,
          },
          {
            lat: 49.26666061700508,
            lng: -123.1645691240509,
          },
        ],
        perimeter: 173,
        perimeter_unit: 'm',
        organic_status: 'Non-Organic',
        deleted: false,
        station_id: null,
        transition_date: null,
      },
      planting_management_plan: {
        is_final_planting_management_plan: true,
        is_planting_method_known: false,
        location_id: '7ef87edc-73b6-11ed-ac0f-7bd8b506ce4c',
        management_plan_id: 2,
        planting_management_plan_id: '0f8cdaf4-e54f-49f7-bb47-0ee5901ad3c5',
        estimated_seeds: null,
        estimated_seeds_unit: 'kg',
        notes: null,
        pin_coordinate: null,
        planting_method: null,
        location: {
          farm_id: '8350e6e6-7216-11ed-b431-2792462c3cd9',
          name: 'field',
          notes: '',
          location_id: '7ef87edc-73b6-11ed-ac0f-7bd8b506ce4c',
          figure_id: '7ef87edd-73b6-11ed-ac0f-7bd8b506ce4c',
          type: 'field',
          total_area: 1305,
          total_area_unit: 'ha',
          grid_points: [
            {
              lat: 49.267017666134535,
              lng: -123.16514311678009,
            },
            {
              lat: 49.26669912242765,
              lng: -123.16553471929626,
            },
            {
              lat: 49.26666061700508,
              lng: -123.1645691240509,
            },
          ],
          perimeter: 173,
          perimeter_unit: 'm',
          organic_status: 'Non-Organic',
          deleted: false,
          station_id: null,
          transition_date: null,
        },
      },
      firstTaskDate: '2022-12-24T00:00:00.000',
      status: 'active',
    },
  ],
};

export const CleaningTask = Template.bind({});
CleaningTask.args = {
  handleGoBack: () => console.log('handleGoBack called'),
  onSubmit: () => console.log('onSave called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  useHookFormPersist: () => ({}),
  persistedFormData: {
    type: 91,
    due_date: '2021-08-23',
    locations: [
      {
        location_id: '1f31e024-2e98-44e4-9837-80f52d8ab010',
      },
      {
        location_id: '61f7cd2c-c09d-43cf-9687-a0502236acfd',
      },
    ],
    managementPlans: [
      {
        management_plan_id: 1166,
      },
      {
        management_plan_id: 1177,
      },
      {
        management_plan_id: 1179,
      },
    ],
  },
  selectedTaskType: {
    task_type_id: 91,
    task_name: 'Cleaning',
    task_translation_key: 'CLEANING_TASK',
    farm_id: null,
  },
  persistedPaths: [],
  products: [],
  system: 'metric',
  managementPlanByLocations: managementPlansByLocationIds,
};
CleaningTask.parameters = {
  ...chromaticSmallScreen,
};

export const PestControlTask = Template.bind({});
PestControlTask.args = {
  handleGoBack: () => console.log('handleGoBack called'),
  onSubmit: () => console.log('onSave called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  useHookFormPersist: () => ({}),
  persistedFormData: {
    type: 11,
    due_date: '2021-08-23',
    locations: [
      {
        location_id: '1f31e024-2e98-44e4-9837-80f52d8ab010',
      },
      {
        location_id: '61f7cd2c-c09d-43cf-9687-a0502236acfd',
      },
    ],
    managementPlans: [
      {
        management_plan_id: 1166,
      },
      {
        management_plan_id: 1177,
      },
      {
        management_plan_id: 1179,
      },
    ],
  },
  selectedTaskType: {
    task_type_id: 11,
    task_name: 'Pest Control',
    task_translation_key: 'PEST_CONTROL_TASK',
    farm_id: null,
  },
  persistedPaths: [],
  products: [],
  system: 'metric',
  managementPlanByLocations: managementPlansByLocationIds,
};
PestControlTask.parameters = {
  ...chromaticSmallScreen,
};

export const FieldWorkTask = Template.bind({});
FieldWorkTask.args = {
  handleGoBack: () => console.log('handleGoBack called'),
  onSubmit: () => console.log('onSave called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  useHookFormPersist: () => ({}),
  persistedFormData: {
    type: 9,
    due_date: '2021-08-23',
    locations: [
      {
        location_id: '1f31e024-2e98-44e4-9837-80f52d8ab010',
      },
      {
        location_id: '61f7cd2c-c09d-43cf-9687-a0502236acfd',
      },
    ],
    managementPlans: [
      {
        management_plan_id: 1166,
      },
      {
        management_plan_id: 1177,
      },
      {
        management_plan_id: 1179,
      },
    ],
  },
  selectedTaskType: {
    task_type_id: 9,
    task_name: 'Field Work',
    task_translation_key: 'FIELD_WORK_TASK',
    farm_id: null,
  },
  persistedPaths: [],
  products: [],
  system: 'metric',
  managementPlanByLocations: managementPlansByLocationIds,
};
FieldWorkTask.parameters = {
  ...chromaticSmallScreen,
};

const soilAmendmentTaskArgs = {
  handleGoBack: () => console.log('handleGoBack called'),
  onSubmit: () => console.log('onSave called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  useHookFormPersist: () => ({}),
  persistedFormData: {
    type: 6,
    due_date: '2021-08-23',
    locations: [
      { location_id: '1f31e024-2e98-44e4-9837-80f52d8ab010' },
      { location_id: '61f7cd2c-c09d-43cf-9687-a0502236acfd' },
    ],
    managementPlans: [
      { management_plan_id: 1166 },
      { management_plan_id: 1177 },
      { management_plan_id: 1179 },
    ],
  },
  selectedTaskType: {
    task_type_id: 6,
    task_name: 'Soil Amendment',
    task_translation_key: 'SOIL_AMENDMENT_TASK',
    farm_id: null,
  },
  farm: {
    farm_id: '71d84984-88cc-11eb-84e5-0a7facd3678d',
    country_id: null,
    interested: true,
  },
  persistedPaths: [],
  products: [],
  system: 'metric',
  managementPlanByLocations: managementPlansByLocationIds,
};

export const MetricSoilAmendmentTask = Template.bind({});
MetricSoilAmendmentTask.args = soilAmendmentTaskArgs;
MetricSoilAmendmentTask.parameters = {
  ...chromaticSmallScreen,
};
MetricSoilAmendmentTask.play = async ({ canvasElement }) => {
  const quantityTest = new UnitTest(canvasElement, 'unit');
  await quantityTest.inputNotToHaveValue();
  await quantityTest.selectedUnitToBeInTheDocument('kg');
};

export const imperialSoilAmendmentTask = Template.bind({});
imperialSoilAmendmentTask.args = { ...soilAmendmentTaskArgs, system: 'imperial' };
imperialSoilAmendmentTask.parameters = {
  ...chromaticSmallScreen,
};
imperialSoilAmendmentTask.play = async ({ canvasElement }) => {
  const quantityTest = new UnitTest(canvasElement, 'unit');
  await quantityTest.inputNotToHaveValue();
  await quantityTest.selectedUnitToBeInTheDocument('lb');
};

export const HarvestTask = Template.bind({});
HarvestTask.args = {
  handleGoBack: () => console.log('handleGoBack called'),
  onSubmit: () => console.log('onSave called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  useHookFormPersist: () => ({}),
  persistedFormData: {
    type: 8,
    due_date: '2021-08-23',
    locations: [
      { location_id: '1f31e024-2e98-44e4-9837-80f52d8ab010' },
      { location_id: '61f7cd2c-c09d-43cf-9687-a0502236acfd' },
    ],
    managementPlans: [
      { management_plan_id: 1166 },
      { management_plan_id: 1177 },
      { management_plan_id: 1179 },
    ],
    harvest_tasks: [],
  },
  selectedTaskType: {
    task_type_id: 8,
    task_name: 'Harvesting',
    task_translation_key: 'HARVEST_TASK',
    farm_id: null,
  },
  persistedPaths: [],
  products: [],
  system: 'metric',
  managementPlanByLocations: managementPlansByLocationIds,
};
HarvestTask.parameters = {
  ...chromaticSmallScreen,
};
HarvestTask.play = async ({ canvasElement }) => {
  const quantityTest0 = new UnitTest(canvasElement, 'harvesttask-quantity-0', harvestAmounts);
  const quantityTest1 = new UnitTest(canvasElement, 'harvesttask-quantity-1', harvestAmounts);

  const canvas = within(canvasElement);
  const [abiuCheckbox, achachaCheckbox] = canvas.getAllByRole('checkbox');

  await quantityTest0.inputNotToHaveValue();
  await quantityTest1.inputNotToHaveValue();
  await quantityTest0.selectedUnitToBeInTheDocument('kg');
  await quantityTest1.selectedUnitToBeInTheDocument('kg');
  await quantityTest0.visibleInputAndComboboxIsEnabled();
  await quantityTest1.visibleInputAndComboboxIsEnabled();

  await quantityTest0.inputValueAndBlur('0.5');
  await quantityTest0.visibleInputToHaveValue(0.5);
  await quantityTest0.hiddenInputToHaveValue(0.5);
  await quantityTest1.inputNotToHaveValue();

  await quantityTest0.selectUnit('mt');
  await quantityTest0.selectedUnitToBeInTheDocument('mt');
  await quantityTest0.visibleInputToHaveValue(0.5);
  await quantityTest0.hiddenInputToHaveValue(
    quantityTest0.convertDisplayValueToHiddenValue(0.5, 'mt'),
  );
  await quantityTest1.inputNotToHaveValue();
  await quantityTest1.selectedUnitToBeInTheDocument('kg');

  await userEvent.click(abiuCheckbox);
  await quantityTest0.inputNotToHaveValue();
  await quantityTest0.visibleInputAndComboxIsDisabled();
  await quantityTest0.selectedUnitToBeInTheDocument('mt');

  await userEvent.click(achachaCheckbox);
  await quantityTest1.inputNotToHaveValue();
  await quantityTest1.selectedUnitToBeInTheDocument('kg');
  await quantityTest1.visibleInputAndComboxIsDisabled();

  await userEvent.click(achachaCheckbox);
  await quantityTest1.inputNotToHaveValue();
  await quantityTest1.selectedUnitToBeInTheDocument('kg');
  await quantityTest1.visibleInputAndComboboxIsEnabled();

  await quantityTest1.inputValueAndBlur('20');
  await quantityTest1.visibleInputToHaveValue(20);
  await quantityTest1.hiddenInputToHaveValue(20);
  await quantityTest0.inputNotToHaveValue();
  await quantityTest0.visibleInputAndComboxIsDisabled();
  await quantityTest0.selectedUnitToBeInTheDocument('mt');

  await quantityTest1.inputValueAndBlur('1000000001');
  await quantityTest1.haveMaxValueError();

  await userEvent.click(achachaCheckbox);
  await quantityTest1.inputNotToHaveValue();
  await quantityTest1.haveNoError();
};
