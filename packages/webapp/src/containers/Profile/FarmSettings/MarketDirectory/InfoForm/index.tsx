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
// @ts-expect-error untyped package
import Script from 'react-load-script';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PureMarketDirectoryInfoForm from '../../../../../components/MarketDirectory/InfoForm';
import useDefaultMarketDirectoryData from './useDefaultMarketDirectoryData';
import { DIRECTORY_INFO_FIELDS, MarketDirectoryInfoFormFields } from './types';
import useImagePickerUpload from '../../../../../components/ImagePicker/useImagePickerUpload';
import { useAddMarketDirectoryInfoMutation } from '../../../../../store/api/marketDirectoryInfoApi';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../../../Snackbar/snackbarSlice';
import InFormButtons from '../../../../../components/Form/InFormButtons';
import { isLatLng, reverseGeocode } from '../../../../../util/google-maps/reverseGeocode';

export enum FormMode {
  ADD = 'add',
  EDIT = 'edit',
  READONLY = 'readonly',
}
interface MarketDirectoryInfoFormProps {
  setIsComplete: (isComplete: boolean) => void;
  close: () => void;
}

const MarketDirectoryInfoForm = ({ setIsComplete, close }: MarketDirectoryInfoFormProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { getOnFileUpload } = useImagePickerUpload();

  // LF-4991 const { data: marketDirectoryInfo } = useGetMarketDirectoryInfoQuery();
  const hasExistingRecord = false; //!!marketDirectoryInfo

  const initialFormMode = hasExistingRecord ? FormMode.READONLY : FormMode.ADD;
  const [formMode, setFormMode] = useState<FormMode>(initialFormMode);

  const userFarmDefaults = useDefaultMarketDirectoryData();
  const defaultValues =
    // LF-4991 marketDirectoryInfo ||
    userFarmDefaults;

  const formMethods = useForm<MarketDirectoryInfoFormFields>({
    mode: 'onBlur',
    defaultValues: defaultValues,
  });

  const [addMarketDirectoryInfo] = useAddMarketDirectoryInfoMutation();
  // LF-5012 const [updateMarketDirectoryInfo] = useUpdateMarketDirectoryInfoMutation();

  const onSubmit = async (formData: any) => {
    if (formMode === FormMode.READONLY) {
      setFormMode(FormMode.EDIT);
      return;
    }

    const apiCall = hasExistingRecord
      ? addMarketDirectoryInfo
      : // LF-5012 updateMarketDirectoryInfo
        addMarketDirectoryInfo;

    try {
      await apiCall(formData).unwrap();

      const message = hasExistingRecord
        ? // LF-5012 t('message:MARKET_DIRECTORY.SUCCESS.UPDATE')
          'To be implemented'
        : t('message:MARKET_DIRECTORY.SUCCESS.SAVE');

      dispatch(enqueueSuccessSnackbar(message));
      setIsComplete(true);
      close();
    } catch (error) {
      console.error(error);

      const message = hasExistingRecord
        ? // LF-5012 t('message:MARKET_DIRECTORY.ERROR.UPDATE')
          'To be implemented'
        : t('message:MARKET_DIRECTORY.ERROR.SAVE');

      dispatch(enqueueErrorSnackbar(message));
    }
  };

  const onCancel = () => {
    if (formMode === FormMode.READONLY) {
      return;
    }
    if (formMode === FormMode.ADD) {
      close();
      return;
    }
    formMethods.reset(defaultValues);
    setFormMode(FormMode.READONLY);
  };

  // Geocode lat/lng address if needed
  const handleGeocode = () => {
    const address = defaultValues[DIRECTORY_INFO_FIELDS.ADDRESS];

    if (address && isLatLng(address)) {
      reverseGeocode(address).then((formattedAddress) => {
        formMethods.setValue(DIRECTORY_INFO_FIELDS.ADDRESS, formattedAddress, {
          shouldValidate: true,
        });
      });
    }
  };

  return (
    <>
      <Script
        url={`https://maps.googleapis.com/maps/api/js?key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }&libraries=places&language=en-US`}
        onLoad={handleGeocode}
      />
      <FormProvider {...formMethods}>
        <PureMarketDirectoryInfoForm
          close={close}
          getOnFileUpload={getOnFileUpload}
          formMode={formMode}
        />
        <InFormButtons
          confirmText={formMode === FormMode.READONLY ? t('common:EDIT') : t('common:SAVE')}
          onCancel={formMode === FormMode.READONLY ? undefined : onCancel}
          onConfirm={formMethods.handleSubmit(onSubmit)}
          isDisabled={!formMethods.formState.isValid}
          confirmButtonType="submit"
        />
      </FormProvider>
    </>
  );
};

export default MarketDirectoryInfoForm;
