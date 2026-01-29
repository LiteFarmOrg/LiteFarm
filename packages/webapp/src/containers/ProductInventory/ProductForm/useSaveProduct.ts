/*
 *  Copyright 2025 LiteFarm.org
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

import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { getProducts } from '../../Task/saga';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';
import { hasNoValue } from '../../../components/Task/SoilAmendmentTask';
import {
  useAddSoilAmendmentProductMutation,
  useUpdateSoilAmendmentProductMutation,
} from '../../../store/api/apiSlice';
import { TASK_TYPES } from '../../Task/constants';
import { Product, SoilAmendmentProduct } from '../../../store/api/types';
import {
  MolecularCompound,
  Nutrients,
  type SoilAmendmentProductFormCommonFields,
  type ProductId,
} from '../../../components/Task/AddSoilAmendmentProducts/types';
import { FormMode } from '../';

export type SoilAmendmentProductFormAllFields = SoilAmendmentProductFormCommonFields & {
  product_id?: Product['product_id'];
  name?: Product['name'];
};

const formatSoilAmendmentProduct = (data: SoilAmendmentProductFormAllFields) => {
  const { name, product_id, supplier, on_permitted_substances_list, composition, ...body } = data;
  delete body.dry_matter_content;

  const formattedData: Partial<SoilAmendmentProduct> = {
    type: TASK_TYPES.SOIL_AMENDMENT,
    supplier,
    on_permitted_substances_list,
    soil_amendment_product: { ...body, ...composition },
    ...(name ? { name } : {}),
    ...(product_id ? { product_id } : {}),
  };

  if (hasNoValue(Object.values(Nutrients), formattedData.soil_amendment_product!)) {
    delete formattedData.soil_amendment_product!.elemental_unit;
  }
  if (hasNoValue(Object.values(MolecularCompound), formattedData.soil_amendment_product!)) {
    delete formattedData.soil_amendment_product!.molecular_compounds_unit;
  }

  return formattedData;
};

const formatFunctionsMap = {
  [TASK_TYPES.SOIL_AMENDMENT]: formatSoilAmendmentProduct,
};

interface UseSaveProductProps {
  formMode: FormMode | null;
  productFormType: Product['type'] | null;
}

const useSaveProduct = ({ formMode, productFormType }: UseSaveProductProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [addSoilAmendmentProduct] = useAddSoilAmendmentProductMutation();
  const [updateSoilAmendmentProduct] = useUpdateSoilAmendmentProductMutation();

  const onSave = async (
    data: SoilAmendmentProductFormAllFields,
    onSuccess: (product_id: ProductId) => void = () => {},
    onError?: () => void,
  ) => {
    if (!formMode || !productFormType) {
      return;
    }

    const isNew = [FormMode.CREATE, FormMode.DUPLICATE].includes(formMode);
    let apiCall = null;

    if (productFormType === TASK_TYPES.SOIL_AMENDMENT) {
      apiCall = isNew ? addSoilAmendmentProduct : updateSoilAmendmentProduct;
    } else {
      throw new Error(`Unsupported product type: ${productFormType}`);
    }

    const formatter = formatFunctionsMap[productFormType];

    const formattedData = formatter(data);

    let result: SoilAmendmentProduct;

    try {
      result = await apiCall(formattedData).unwrap();
    } catch (e) {
      console.error(e);
      const message = isNew ? t('message:PRODUCT.ERROR.CREATE') : t('message:PRODUCT.ERROR.UPDATE');
      dispatch(enqueueErrorSnackbar(message));
      onError?.();
      return;
    }

    const onProductsFetched = () => {
      const message = isNew
        ? t('message:PRODUCT.SUCCESS.CREATE')
        : t('message:PRODUCT.SUCCESS.UPDATE');
      dispatch(enqueueSuccessSnackbar(message));

      // Set product_id for the newly created product. Should be called after getProducts()
      onSuccess(result.product_id);
    };

    dispatch(getProducts({ callback: onProductsFetched }));
  };

  if (!formMode || [FormMode.DELETE, FormMode.READ_ONLY].includes(formMode)) {
    return;
  }

  if (formMode === FormMode.ADD) {
    throw new Error('FormMode.ADD not implemented yet');
  }

  return onSave;
};

export default useSaveProduct;
