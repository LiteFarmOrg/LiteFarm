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

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../../Task/saga';
import { isProductUsedInPlannedTasksSelector, productSelector } from '../../productSlice';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';
import { useDeleteSoilAmendmentProductMutation } from '../../../store/api/apiSlice';
import { TASK_TYPES } from '../../Task/constants';
import type { Product } from '../../../store/api/types';
import { FormMode } from '..';

interface useRemoveProductProps {
  productFormType: Product['type'] | null;
  formMode: FormMode | null;
  productId?: Product['product_id'];
  onRemovalSuccess: () => void;
  onRemovalCancel: () => void;
}

const useRemoveProduct = ({
  productFormType,
  formMode,
  productId,
  onRemovalSuccess,
  onRemovalCancel,
}: useRemoveProductProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isRemoveModalOpen, setisRemoveModalOpen] = useState(false);
  const [isCannotRemoveModalOpen, setisCannotRemoveModalOpen] = useState(false);

  const product = useSelector(productSelector(productId));
  const productName = product?.name;

  const isProductInUse = useSelector(isProductUsedInPlannedTasksSelector(productId));

  const [deleteSoilAmendmentProduct] = useDeleteSoilAmendmentProductMutation();

  useEffect(() => {
    if (formMode === FormMode.DELETE && productId) {
      if (isProductInUse) {
        setisCannotRemoveModalOpen(true);
      } else {
        setisRemoveModalOpen(true);
      }
    }
  }, [formMode, productId, isProductInUse]);

  const onRemove = async () => {
    if (!formMode || !productFormType || !productId) {
      return;
    }

    let apiCall = null;

    if (productFormType === TASK_TYPES.SOIL_AMENDMENT) {
      apiCall = deleteSoilAmendmentProduct;
    } else {
      throw new Error(`Unsupported product type: ${productFormType}`);
    }

    try {
      await apiCall(productId).unwrap();
    } catch (e) {
      console.error(e);
      dispatch(enqueueErrorSnackbar(t('message:PRODUCT.ERROR.REMOVE')));
      setisRemoveModalOpen(false);
      return;
    }

    const onProductsFetched = () => {
      dispatch(enqueueSuccessSnackbar(t('message:PRODUCT.SUCCESS.REMOVE')));
      setisRemoveModalOpen(false);
      onRemovalSuccess();
    };

    dispatch(getProducts({ callback: onProductsFetched }));
  };

  return {
    isRemoveModalOpen,
    isCannotRemoveModalOpen,
    onRemove,
    cancelRemoval: () => {
      setisRemoveModalOpen(false);
      setisCannotRemoveModalOpen(false);
      onRemovalCancel();
    },
    productName,
  };
};

export default useRemoveProduct;
