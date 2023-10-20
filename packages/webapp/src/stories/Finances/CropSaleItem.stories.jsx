/*
 *  Copyright 2023 LiteFarm.org
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
import CropSaleItem from '../../components/Forms/GeneralRevenue/CropSaleItem';
import { componentDecorators } from '../Pages/config/Decorators';
import { useForm } from 'react-hook-form';

const CropSaleItemWithHookForm = (props) => {
  const reactHookFormFunctions = useForm({
    mode: 'onChange',
  });
  const { handleSubmit } = reactHookFormFunctions;
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <CropSaleItem reactHookFormFunctions={reactHookFormFunctions} {...props} />
    </form>
  );
};

export default {
  title: 'Components/CropSaleItem',
  component: CropSaleItemWithHookForm,
  decorators: componentDecorators,
};

const Template = (args) => <CropSaleItemWithHookForm {...args} />;
export const Primary = Template.bind({});

Primary.args = {
  managementPlan: {
    crop_common_name: 'Apple',
    crop_genus: 'Malus',
    crop_group: 'Fruit and nuts',
    crop_id: 25,
    crop_photo_url: 'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apple.webp',
    crop_specie: 'domestica',
    crop_subgroup: 'Pome fruits and stone fruits',
    crop_translation_key: 'APPLE',
    farm_id: null,
    can_be_cover_crop: false,
    planting_depth: null,
    yield_per_area: 10.725,
    average_seed_weight: null,
    yield_per_plant: null,
    lifecycle: 'PERENNIAL',
    seeding_type: 'SEEDLING_OR_PLANTING_STOCK',
    needs_transplant: false,
    germination_days: null,
    transplant_days: null,
    harvest_days: 730,
    termination_days: null,
    planting_method: 'ROW_METHOD',
    plant_spacing: null,
    seeding_rate: null,
    hs_code_id: '8081000',
    crop_variety_id: '51cee7c8-58b9-11ee-8cb8-ce0b8496eaaa',
    crop_variety_name: 'Apple',
    crop_varietal: '',
    crop_cultivar: '',
    supplier: '',
    compliance_file_url: '',
    organic: null,
    treated: null,
    genetically_engineered: null,
    searched: null,
    crop_variety_photo_url:
      'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apple.webp',
    crop: {
      crop_common_name: 'Apple',
      crop_genus: 'Malus',
      crop_group: 'Fruit and nuts',
      crop_id: 25,
      crop_photo_url: 'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apple.webp',
      crop_specie: 'domestica',
      crop_subgroup: 'Pome fruits and stone fruits',
      crop_translation_key: 'APPLE',
      farm_id: null,
      can_be_cover_crop: false,
      planting_depth: null,
      yield_per_area: 10.725,
      average_seed_weight: null,
      yield_per_plant: null,
      lifecycle: 'PERENNIAL',
      seeding_type: 'SEEDLING_OR_PLANTING_STOCK',
      needs_transplant: true,
      germination_days: null,
      transplant_days: null,
      harvest_days: 730,
      termination_days: null,
      planting_method: 'ROW_METHOD',
      plant_spacing: null,
      seeding_rate: null,
      hs_code_id: '8081000',
    },
    management_plan_id: 1,
    notes: '',
    name: 'Plan 1',
    start_date: '2023-09-21T00:00:00.000',
    complete_date: null,
    abandon_date: null,
    complete_notes: null,
    abandon_reason: null,
    management_plan_group_id: null,
    repetition_number: null,
    management_plan_group: null,
    harvested_to_date: 30,
    already_in_ground: true,
    estimated_revenue: 32,
    for_cover: false,
    germination_date: null,
    harvest_date: '2023-09-30T00:00:00.000',
    is_seed: null,
    is_wild: true,
    plant_date: null,
    seed_date: '2023-02-09T00:00:00.000',
    termination_date: null,
    transplant_date: null,
    estimated_yield_unit: 'kg',
    estimated_yield: 32,
    estimated_price_per_mass: 1,
    estimated_price_per_mass_unit: 'kg',
    crop_management_plan: {
      already_in_ground: true,
      estimated_revenue: 32,
      for_cover: false,
      germination_date: null,
      harvest_date: '2023-09-30T00:00:00.000',
      is_seed: null,
      is_wild: true,
      management_plan_id: 1,
      needs_transplant: false,
      plant_date: null,
      seed_date: '2023-02-09T00:00:00.000',
      termination_date: null,
      transplant_date: null,
      estimated_yield_unit: 'kg',
      estimated_yield: 32,
      estimated_price_per_mass: 1,
      estimated_price_per_mass_unit: 'kg',
    },
    crop_variety: {
      crop_common_name: 'Apple',
      crop_genus: 'Malus',
      crop_group: 'Fruit and nuts',
      crop_id: 25,
      crop_photo_url: 'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apple.webp',
      crop_specie: 'domestica',
      crop_subgroup: 'Pome fruits and stone fruits',
      crop_translation_key: 'APPLE',
      farm_id: null,
      can_be_cover_crop: false,
      planting_depth: null,
      yield_per_area: 10.725,
      average_seed_weight: null,
      yield_per_plant: null,
      lifecycle: 'PERENNIAL',
      seeding_type: 'SEEDLING_OR_PLANTING_STOCK',
      needs_transplant: true,
      germination_days: null,
      transplant_days: null,
      harvest_days: 730,
      termination_days: null,
      planting_method: 'ROW_METHOD',
      plant_spacing: null,
      seeding_rate: null,
      hs_code_id: '8081000',
      crop_variety_id: '51cee7c8-58b9-11ee-8cb8-ce0b8496eaaa',
      crop_variety_name: 'Apple',
      crop_varietal: '',
      crop_cultivar: '',
      supplier: '',
      compliance_file_url: '',
      organic: null,
      treated: null,
      genetically_engineered: null,
      searched: null,
      crop_variety_photo_url:
        'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apple.webp',
      crop: {
        crop_common_name: 'Apple',
        crop_genus: 'Malus',
        crop_group: 'Fruit and nuts',
        crop_id: 25,
        crop_photo_url:
          'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apple.webp',
        crop_specie: 'domestica',
        crop_subgroup: 'Pome fruits and stone fruits',
        crop_translation_key: 'APPLE',
        farm_id: null,
        can_be_cover_crop: false,
        planting_depth: null,
        yield_per_area: 10.725,
        average_seed_weight: null,
        yield_per_plant: null,
        lifecycle: 'PERENNIAL',
        seeding_type: 'SEEDLING_OR_PLANTING_STOCK',
        needs_transplant: true,
        germination_days: null,
        transplant_days: null,
        harvest_days: 730,
        termination_days: null,
        planting_method: 'ROW_METHOD',
        plant_spacing: null,
        seeding_rate: null,
        hs_code_id: '8081000',
      },
    },
  },
  system: 'metric',
  currency: '$',
  cropVarietyId: '51cee7c8-58b9-11ee-8cb8-ce0b8496eaaa',
  disabledInput: false,
};
