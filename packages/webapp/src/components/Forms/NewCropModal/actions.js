import {
  GET_CROPS,
  CREATE_CROP,
} from "./constants";

import {
  SET_CROPS_IN_STATE,
} from '../../../containers/Field/constants'

export const getCrops = () => {
  return {
    type: GET_CROPS,
  }
};


export const setCropsInState = (crops) => {
  return {
    type: SET_CROPS_IN_STATE,
    crops
  }
};

export const createCropAction = (cropData) => {
  return {
    type: CREATE_CROP,
    crop_id: cropData.cropId,
        crop_common_name: cropData.crop_common_name,
        crop_genus: cropData.crop_genus,
        crop_specie: cropData.crop_specie,
        crop_group: cropData.crop_group,
        crop_subgroup: cropData.crop_subgroup,
        max_rooting_depth: cropData.max_rooting_depth,
        depletion_fraction: cropData.depletion_fraction,
        is_avg_depth: cropData.is_avg_depth,
        initial_kc: cropData.initial_kc,
        mid_kc: cropData.mid_kc,
        end_kc: cropData.end_kc,
        max_height: cropData.max_height,
        is_avg_kc: cropData.is_avg_kc,
        nutrient_notes: cropData.nutrient_notes,
        nutrient_credits: cropData.nutrient_credits,
        percentrefuse: cropData.percentrefuse,
        refuse: cropData.refuse,
        protein: cropData.protein,
        lipid: cropData.lipid,
        energy: cropData.energy,
        ca: cropData.ca,
        fe: cropData.fe,
        mg: cropData.mg,
        ph: cropData.ph,
        k: cropData.k,
        na: cropData.na,
        zn: cropData.zn,
        cu: cropData.cu,
        fl: cropData.fl,
        mn: cropData.mn,
        se: cropData.se,
        vita_rae: cropData.vita_rae,
        vite: cropData.vite,
        vitc: cropData.vitc,
        thiamin: cropData.thiamin,
        riboflavin: cropData.riboflavin,
        niacin: cropData.niacin,
        pantothenic: cropData.pantothenic,
        vitb6: cropData.vitb6,
        folate: cropData.folate,
        vitb12: cropData.vitb12,
        vitk: cropData.vitk,
        is_avg_nutrient: cropData.is_avg_nutrient,
        farm_id: cropData.farm_id,
        user_added: cropData.user_added,
        deleted: cropData.deleted,
  }
};
