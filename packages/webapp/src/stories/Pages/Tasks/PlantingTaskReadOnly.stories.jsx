/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
import React from 'react';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import decorator from '../config/Decorators';
import UnitTest from '../../../test-utils/storybook/unit';
import { container_planting_depth } from '../../../util/convert-units/unit';

export default {
  title: 'Form/Crop/Tasks/PlantingTaskReadOnly',
  component: PureTaskReadOnly,
  decorators: decorator,
};

const Template = (args) => <PureTaskReadOnly {...args} />;

const args = {
  task: {
    task_id: 124,
    due_date: '2023-03-27T00:00:00.000',
    owner_user_id: '7212c8c6-a0b6-11ed-be24-e66db4bef552',
    task_type_id: 5,
    locations: [
      {
        farm_id: '7ec07118-a0b6-11ed-88a9-e66db4bef552',
        name: 'First garden',
        notes: '',
        location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
        deleted: false,
        location_defaults: {
          location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
          estimated_flow_rate: null,
          estimated_flow_rate_unit: null,
          application_depth: null,
          application_depth_unit: null,
          irrigation_type_id: 2,
        },
        figure_id: '91be84d4-a0b7-11ed-be24-e66db4bef552',
        type: 'garden',
        total_area: 43815,
        total_area_unit: 'ha',
        grid_points: [
          { lat: 49.258605926335534, lng: -123.24441431750488 },
          { lat: 49.25925011822781, lng: -123.24244021166992 },
          { lat: 49.257205480170306, lng: -123.24072359790038 },
          { lat: 49.2564772324602, lng: -123.2428693651123 },
        ],
        perimeter: 858,
        perimeter_unit: 'm',
        station_id: null,
        organic_status: 'Non-Organic',
        transition_date: null,
      },
    ],
    managementPlans: [
      {
        crop_common_name: 'Abiu',
        crop_genus: 'Pouteria',
        crop_group: 'Fruit and nuts',
        crop_id: 168,
        crop_photo_url:
          'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/abiu.webp',
        crop_specie: 'caimito',
        crop_subgroup: 'Tropical and subtropical fruits',
        crop_translation_key: 'ABIU',
        farm_id: '7ec07118-a0b6-11ed-88a9-e66db4bef552',
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
        crop_variety_id: '0baee99a-b405-11ed-9a09-e66db4bef551',
        crop_variety_name: 'Variety',
        supplier: 'Supplier',
        compliance_file_url: '',
        organic: true,
        treated: 'YES',
        genetically_engineered: null,
        searched: null,
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
        management_plan_id: 21,
        notes: '',
        name: 'Plan 0327',
        start_date: null,
        complete_date: null,
        abandon_date: null,
        complete_notes: null,
        abandon_reason: null,
        already_in_ground: false,
        for_cover: false,
        germination_date: '2023-04-11T00:00:00.000',
        harvest_date: '2027-03-26T00:00:00.000',
        is_seed: true,
        seed_date: '2023-03-27T00:00:00.000',
        estimated_yield_unit: 'mt',
        estimated_yield: 20790,
        estimated_revenue: null,
        is_wild: null,
        plant_date: null,
        termination_date: null,
        transplant_date: null,
        estimated_price_per_mass: null,
        estimated_price_per_mass_unit: 'kg',
        crop_management_plan: {},
        crop_variety: {},
        planting_management_plan: {
          estimated_seeds: 2.295,
          estimated_seeds_unit: 'kg',
          is_final_planting_management_plan: true,
          location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
          management_plan_id: 21,
          planting_management_plan_id: '1754eb6d-ac62-4a23-aec0-32dbac7f73da',
          planting_method: 'ROW_METHOD',
          is_planting_method_known: null,
          notes: null,
          pin_coordinate: null,
          row_method: {},
          location: {},
        },
      },
    ],
    location_defaults: [],
    notes: null,
    completion_notes: null,
    assignee_user_id: null,
    coordinates: null,
    duration: null,
    wage_at_moment: 0,
    happiness: null,
    complete_date: null,
    late_time: null,
    for_review_time: null,
    abandon_date: null,
    abandonment_reason: null,
    other_abandonment_reason: null,
    abandonment_notes: null,
    taskType: {
      task_type_id: 5,
      task_name: 'Planting',
      task_translation_key: 'PLANT_TASK',
      farm_id: null,
      deleted: false,
    },
    plant_task: {
      planting_management_plan_id: '1754eb6d-ac62-4a23-aec0-32dbac7f73da',
      task_id: 124,
      planting_management_plan: {
        estimated_seeds: 2.295,
        estimated_seeds_unit: 'kg',
        is_final_planting_management_plan: true,
        location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
        management_plan_id: 21,
        planting_management_plan_id: '1754eb6d-ac62-4a23-aec0-32dbac7f73da',
        planting_method: 'ROW_METHOD',
        is_planting_method_known: null,
        notes: null,
        pin_coordinate: null,
        row_method: {
          number_of_rows: 10,
          plant_spacing: 0.3,
          plant_spacing_unit: 'cm',
          planting_depth: 0.01,
          planting_depth_unit: 'cm',
          planting_management_plan_id: '1754eb6d-ac62-4a23-aec0-32dbac7f73da',
          row_length: 8,
          row_length_unit: 'm',
          row_spacing: 0.35,
          row_spacing_unit: 'cm',
          row_width: 0.5,
          row_width_unit: 'cm',
          same_length: true,
          specify_rows: null,
          total_rows_length: null,
          total_rows_length_unit: 'cm',
        },
        location: {},
      },
    },
    pinCoordinates: [],
    managementPlansByPinCoordinate: {},
    locationsById: {
      '91bd7698-a0b7-11ed-be24-e66db4bef552': {},
    },
    managementPlansByLocation: {
      '91bd7698-a0b7-11ed-be24-e66db4bef552': [
        {
          crop_common_name: 'Abiu',
          crop_genus: 'Pouteria',
          crop_group: 'Fruit and nuts',
          crop_id: 168,
          crop_photo_url:
            'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/abiu.webp',
          crop_specie: 'caimito',
          crop_subgroup: 'Tropical and subtropical fruits',
          crop_translation_key: 'ABIU',
          farm_id: '7ec07118-a0b6-11ed-88a9-e66db4bef552',
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
          crop_variety_id: '0baee99a-b405-11ed-9a09-e66db4bef551',
          crop_variety_name: 'Variety',
          supplier: 'Supplier',
          compliance_file_url: '',
          organic: true,
          treated: 'YES',
          genetically_engineered: null,
          searched: null,
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
          management_plan_id: 21,
          notes: '',
          name: 'Plan 0327',
          start_date: null,
          complete_date: null,
          abandon_date: null,
          complete_notes: null,
          abandon_reason: null,
          already_in_ground: false,
          for_cover: false,
          germination_date: '2023-04-11T00:00:00.000',
          harvest_date: '2027-03-26T00:00:00.000',
          is_seed: true,
          seed_date: '2023-03-27T00:00:00.000',
          estimated_yield_unit: 'mt',
          estimated_yield: 20790,
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
            germination_date: '2023-04-11T00:00:00.000',
            harvest_date: '2027-03-26T00:00:00.000',
            is_seed: true,
            management_plan_id: 21,
            needs_transplant: false,
            seed_date: '2023-03-27T00:00:00.000',
            estimated_yield_unit: 'mt',
            estimated_yield: 20790,
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
            farm_id: '7ec07118-a0b6-11ed-88a9-e66db4bef552',
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
            crop_variety_id: '0baee99a-b405-11ed-9a09-e66db4bef551',
            crop_variety_name: 'Variety',
            supplier: 'Supplier',
            compliance_file_url: '',
            organic: true,
            treated: 'YES',
            genetically_engineered: null,
            searched: null,
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
          planting_management_plan: {
            estimated_seeds: 2.295,
            estimated_seeds_unit: 'kg',
            is_final_planting_management_plan: true,
            location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
            management_plan_id: 21,
            planting_management_plan_id: '1754eb6d-ac62-4a23-aec0-32dbac7f73da',
            planting_method: 'ROW_METHOD',
            is_planting_method_known: null,
            notes: null,
            pin_coordinate: null,
            row_method: {
              number_of_rows: 10,
              plant_spacing: 0.3,
              plant_spacing_unit: 'cm',
              planting_depth: 0.01,
              planting_depth_unit: 'cm',
              planting_management_plan_id: '1754eb6d-ac62-4a23-aec0-32dbac7f73da',
              row_length: 8,
              row_length_unit: 'm',
              row_spacing: 0.35,
              row_spacing_unit: 'cm',
              row_width: 0.5,
              row_width_unit: 'cm',
              same_length: true,
              specify_rows: null,
              total_rows_length: null,
              total_rows_length_unit: 'cm',
            },
            location: {
              farm_id: '7ec07118-a0b6-11ed-88a9-e66db4bef552',
              name: 'First garden',
              notes: '',
              location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
              deleted: false,
              location_defaults: {
                location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
                estimated_flow_rate: null,
                estimated_flow_rate_unit: null,
                application_depth: null,
                application_depth_unit: null,
                irrigation_type_id: 2,
              },
              figure_id: '91be84d4-a0b7-11ed-be24-e66db4bef552',
              type: 'garden',
              total_area: 43815,
              total_area_unit: 'ha',
              grid_points: [
                { lat: 49.258605926335534, lng: -123.24441431750488 },
                { lat: 49.25925011822781, lng: -123.24244021166992 },
                { lat: 49.257205480170306, lng: -123.24072359790038 },
                { lat: 49.2564772324602, lng: -123.2428693651123 },
              ],
              perimeter: 858,
              perimeter_unit: 'm',
              station_id: null,
              organic_status: 'Non-Organic',
              transition_date: null,
            },
          },
          firstTaskDate: '2023-03-27T00:00:00.000',
          status: 'planned',
        },
      ],
    },
  },
  users: [{ user_id: '1', first_name: 'John', last_name: 'Doe' }],
  user: {
    user_id: '1',
    grid_points: {
      lat: 49.276368899999994,
      lng: -123.177324,
    },
  },
  isAdmin: true,
  managementPlansByLocationIds: [],
  onGoBack: () => {},
  products: [],
  harvestUseTypes: [],
  maxZoomRef: { current: 19 },
  getMaxZoom: () => 19,
};

export const Metric = Template.bind({});
Metric.args = {
  ...args,
  system: 'metric',
};
Metric.play = async ({ canvasElement }) => {
  const plantingDepthTest = new UnitTest(
    canvasElement,
    'planGuidance-plantingDepth',
    container_planting_depth,
  );
  const rowWidthTest = new UnitTest(
    canvasElement,
    'planGuidance-rowWidth',
    container_planting_depth,
  );
  const rowSpacingTest = new UnitTest(
    canvasElement,
    'planGuidance-spaceBetween',
    container_planting_depth,
  );

  // TODO: add tests for "/Crop/RowMethod/PureRowForm.jsx"

  await plantingDepthTest.visibleInputToHaveValue(1);
  await plantingDepthTest.hiddenInputToHaveValue(0.01);
  await plantingDepthTest.selectedUnitToBeInTheDocument('cm');
  await rowWidthTest.visibleInputToHaveValue(50);
  await rowWidthTest.hiddenInputToHaveValue(0.5);
  await rowWidthTest.selectedUnitToBeInTheDocument('cm');
  await rowSpacingTest.visibleInputToHaveValue(35);
  await rowSpacingTest.hiddenInputToHaveValue(0.35);
  await rowSpacingTest.selectedUnitToBeInTheDocument('cm');
};

export const Imperial = Template.bind({});
Imperial.args = {
  ...args,
  system: 'imperial',
};
Imperial.play = async ({ canvasElement }) => {
  const plantingDepthTest = new UnitTest(
    canvasElement,
    'planGuidance-plantingDepth',
    container_planting_depth,
  );
  const rowWidthTest = new UnitTest(
    canvasElement,
    'planGuidance-rowWidth',
    container_planting_depth,
  );
  const rowSpacingTest = new UnitTest(
    canvasElement,
    'planGuidance-spaceBetween',
    container_planting_depth,
  );

  // TODO: add tests for "/Crop/RowMethod/PureRowForm.jsx"

  await plantingDepthTest.visibleInputToHaveValue(
    plantingDepthTest.convertDBValueToDisplayValue(0.01, 'in'),
  );
  await plantingDepthTest.hiddenInputToHaveValue(0.01);
  await plantingDepthTest.selectedUnitToBeInTheDocument('in');
  await rowWidthTest.visibleInputToHaveValue(rowWidthTest.convertDBValueToDisplayValue(0.5, 'ft'));
  await rowWidthTest.hiddenInputToHaveValue(0.5);
  await rowWidthTest.selectedUnitToBeInTheDocument('ft');
  await rowSpacingTest.visibleInputToHaveValue(
    rowSpacingTest.convertDBValueToDisplayValue(0.35, 'ft'),
  );
  await rowSpacingTest.hiddenInputToHaveValue(0.35);
  await rowSpacingTest.selectedUnitToBeInTheDocument('ft');
};
