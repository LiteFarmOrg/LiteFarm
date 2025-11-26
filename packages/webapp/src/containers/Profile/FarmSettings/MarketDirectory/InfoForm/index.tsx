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

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useGoogleMapsLoader } from '../../../../../hooks/useGoogleMapsLoader';
import PureMarketDirectoryInfoForm from '../../../../../components/MarketDirectory/InfoForm';
import useDefaultMarketDirectoryData from './useDefaultMarketDirectoryData';
import { DIRECTORY_INFO_FIELDS, MarketDirectoryInfoFormFields } from './types';
import useImagePickerUpload from '../../../../../components/ImagePicker/useImagePickerUpload';
import {
  useAddMarketDirectoryInfoMutation,
  useUpdateMarketDirectoryInfoMutation,
} from '../../../../../store/api/marketDirectoryInfoApi';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../../../Snackbar/snackbarSlice';
import InFormButtons from '../../../../../components/Form/InFormButtons';
import type { MarketDirectoryInfo } from '../../../../../store/api/types';
import { isFetchBaseQueryError } from '../../../../../store/api/typeGuards';
import { ReactSelectOptionForEnum } from '../../../../../components/Form/ReactSelect/util';
import useMarketDirectoryData from './useMarketDirectoryData';
import { formatMarketDirectoryData } from './util';

export enum FormMode {
  ADD = 'add',
  EDIT = 'edit',
  READONLY = 'readonly',
}
interface MarketDirectoryInfoFormProps {
  marketDirectoryInfo?: MarketDirectoryInfo;
  close: () => void;
  marketProductCategoryOptions: ReactSelectOptionForEnum[];
}

const MarketDirectoryInfoForm = ({
  marketDirectoryInfo,
  close,
  marketProductCategoryOptions,
}: MarketDirectoryInfoFormProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { getOnFileUpload } = useImagePickerUpload();

  useGoogleMapsLoader(['places']);

  const hasExistingRecord = !!marketDirectoryInfo;

  const initialFormMode = hasExistingRecord ? FormMode.READONLY : FormMode.ADD;
  const [formMode, setFormMode] = useState<FormMode>(initialFormMode);

  const isReadonly = formMode === FormMode.READONLY;

  const userFarmDefaults = useDefaultMarketDirectoryData();
  const marketDirectoryData = useMarketDirectoryData(marketDirectoryInfo);
  const defaultValues = marketDirectoryData || userFarmDefaults;

  const formMethods = useForm<MarketDirectoryInfoFormFields>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: defaultValues,
  });

  const [addMarketDirectoryInfo] = useAddMarketDirectoryInfoMutation();
  const [updateMarketDirectoryInfo] = useUpdateMarketDirectoryInfoMutation();

  const onSubmit = async (formData: MarketDirectoryInfoFormFields) => {
    const { valid_place, ...dataToSubmit } = formData;
    const formattedDataToSubmit = formatMarketDirectoryData(dataToSubmit);
    if (formMode === FormMode.READONLY) {
      setFormMode(FormMode.EDIT);
      return;
    }

    const apiCall = hasExistingRecord ? updateMarketDirectoryInfo : addMarketDirectoryInfo;

    try {
      await apiCall(formattedDataToSubmit).unwrap();

      const message = hasExistingRecord
        ? t('message:MARKET_DIRECTORY.SUCCESS.UPDATE')
        : t('message:MARKET_DIRECTORY.SUCCESS.SAVE');

      dispatch(enqueueSuccessSnackbar(message));
      close();
    } catch (error: unknown) {
      console.error(error);

      if (isFetchBaseQueryError(error) && error.data === 'Invalid website') {
        formMethods.setError(DIRECTORY_INFO_FIELDS.WEBSITE, {
          type: 'manual',
          message: t('MARKET_DIRECTORY.INFO_FORM.INVALID_WEBSITE'),
        });
        return;
      }

      const message = hasExistingRecord
        ? t('message:MARKET_DIRECTORY.ERROR.UPDATE')
        : t('message:MARKET_DIRECTORY.ERROR.SAVE');

      dispatch(enqueueErrorSnackbar(message));
    }
  };

  const onCancel = () => {
    if (formMode === FormMode.ADD) {
      close();
      return;
    }
    // Must be in EDIT mode at this point
    formMethods.reset(defaultValues);
    setFormMode(FormMode.READONLY);
  };

  const handleConfirm = isReadonly
    ? () => setFormMode(FormMode.EDIT)
    : formMethods.handleSubmit(onSubmit);

  return (
    <FormProvider {...formMethods}>
      <PureMarketDirectoryInfoForm
        close={close}
        getOnFileUpload={getOnFileUpload}
        formMode={formMode}
        marketProductCategoryOptions={marketProductCategoryOptions}
      />
      <InFormButtons
        confirmText={isReadonly ? t('common:EDIT') : t('common:SAVE')}
        onCancel={isReadonly ? undefined : onCancel}
        onConfirm={handleConfirm}
        isDisabled={!isReadonly && !formMethods.formState.isValid}
        confirmButtonType={isReadonly ? 'button' : 'submit'}
      />
    </FormProvider>
  );
};

export default MarketDirectoryInfoForm;
