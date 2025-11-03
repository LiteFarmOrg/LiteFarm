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

import { useSelector } from 'react-redux';
import { useController, useFormContext, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { getCountryCallingCode } from 'react-phone-number-input/input';
import styles from './styles.module.scss';
import { Semibold } from '../../Typography';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import InputBaseLabel from '../../Form/InputBase/InputBaseLabel';
import Input from '../../Form/Input';
import TextArea from '../../Form/TextArea';
import NumberInput from '../../Form/NumberInput';
import { hookFormMaxValidation, hookFormMinValidation } from '../../Form/hookformValidationUtils';
import ImagePicker from '../../ImagePicker';
import { ReactComponent as InstagramIcon } from '../../../assets/images/socials/instagram.svg';
import { ReactComponent as FacebookIcon } from '../../../assets/images/socials/facebook.svg';
import { ReactComponent as XIcon } from '../../../assets/images/socials/x.svg';
import PrivateBadge from '../../SimpleBadges/PrivateBadge';
import type { GetOnFileUpload } from '../../ImagePicker/useImagePickerUpload';
import {
  DIRECTORY_INFO_FIELDS,
  MarketDirectoryInfoFormFields,
} from '../../../containers/Profile/FarmSettings/MarketDirectory/InfoForm/types';
import { FormMode } from '../../../containers/Profile/FarmSettings/MarketDirectory/InfoForm';

// ImagePickerWrapper/saga.js
const marketDirectoryUrl = 'marketDirectoryInfo';

interface PureMarketDirectoryInfoFormProps {
  close: () => void;
  getOnFileUpload: GetOnFileUpload;
  formMode: FormMode;
}

const PureMarketDirectoryInfoForm = ({
  getOnFileUpload,
  formMode,
}: PureMarketDirectoryInfoFormProps) => {
  const { t } = useTranslation();

  const readonly = formMode === FormMode.READONLY;

  const {
    register,
    control,
    resetField,
    formState: { errors },
  } = useFormContext<MarketDirectoryInfoFormFields>();

  const { field } = useController({ control, name: DIRECTORY_INFO_FIELDS.LOGO });

  const handleSelectImage = (imageUrl: string) => {
    field.onChange(imageUrl);
  };

  const handleRemoveImage = () => {
    resetField(DIRECTORY_INFO_FIELDS.LOGO, { defaultValue: '' });
  };

  const onFileUpload = getOnFileUpload(marketDirectoryUrl, handleSelectImage);

  // @ts-expect-error -- userFarmSelector issue
  const { country_code } = useSelector(userFarmSelector);

  return (
    <div className={styles.formContainer}>
      <section className={styles.section}>
        <Semibold>{t('MARKET_DIRECTORY.INFO_FORM.FARM_IDENTITY')}</Semibold>
        <Input
          label={t('MARKET_DIRECTORY.INFO_FORM.FARM_NAME')}
          hookFormRegister={register(DIRECTORY_INFO_FIELDS.FARM_NAME, { required: true })}
          disabled={readonly}
        />
        {/* @ts-expect-error */}
        <TextArea
          label={t('MARKET_DIRECTORY.INFO_FORM.ABOUT')}
          hookFormRegister={register(DIRECTORY_INFO_FIELDS.ABOUT)}
          optional
          disabled={readonly}
        />

        {!readonly && (
          <ImagePicker
            label={'Farm Logo'}
            onFileUpload={onFileUpload}
            onRemoveImage={handleRemoveImage}
            defaultUrl={field.value}
          />
        )}
      </section>

      <section className={styles.section}>
        <Semibold>{t('MARKET_DIRECTORY.INFO_FORM.FARM_REPRESENTATIVE')}</Semibold>
        <div className={styles.contactNameContainer}>
          <Input
            label={t('PROFILE.ACCOUNT.FIRST_NAME')}
            hookFormRegister={register(DIRECTORY_INFO_FIELDS.CONTACT_FIRST_NAME, {
              required: true,
            })}
            icon={<PrivateBadge />}
            disabled={readonly}
          />
          <Input
            label={t('PROFILE.ACCOUNT.LAST_NAME')}
            hookFormRegister={register(DIRECTORY_INFO_FIELDS.CONTACT_LAST_NAME)}
            optional
            icon={<PrivateBadge />}
            disabled={readonly}
          />
        </div>
        <Input
          label={t('MARKET_DIRECTORY.INFO_FORM.EMAIL_ADDRESS')}
          hookFormRegister={register(DIRECTORY_INFO_FIELDS.CONTACT_EMAIL, { required: true })}
          icon={<PrivateBadge />}
          disabled={readonly}
        />

        <div className={styles.privateInfoContainer}>
          <PrivateBadge />
          <span>{t('MARKET_DIRECTORY.INFO_FORM.PRIVATE_INFO_NOTE')}</span>
        </div>
      </section>

      <section className={styles.section}>
        <Semibold>{t('MARKET_DIRECTORY.INFO_FORM.FARM_STORE_CONTACT')}</Semibold>

        <Input
          label={t('MARKET_DIRECTORY.INFO_FORM.FARM_STORE_LOCATION')}
          hookFormRegister={register(DIRECTORY_INFO_FIELDS.ADDRESS, {
            required: true,
          })}
          disabled={readonly}
        />

        <InputBaseLabel label={t('MARKET_DIRECTORY.INFO_FORM.PHONE_NUMBER')} optional />

        <div className={styles.phoneContainer}>
          <NumberInput
            name={DIRECTORY_INFO_FIELDS.COUNTRY_CODE}
            control={control}
            min={1}
            max={999}
            rules={{
              max: hookFormMaxValidation(999),
              min: hookFormMinValidation(1),
            }}
            disabled={readonly}
            currencySymbol="+"
            placeholder={country_code ? getCountryCallingCode(country_code) : '1'}
          />
          <Input
            hookFormRegister={register(DIRECTORY_INFO_FIELDS.PHONE_NUMBER)}
            optional
            disabled={readonly}
          />
        </div>
        <Input
          label={t('MARKET_DIRECTORY.INFO_FORM.EMAIL_ADDRESS')}
          hookFormRegister={register(DIRECTORY_INFO_FIELDS.EMAIL)}
          optional
          disabled={readonly}
        />
      </section>

      <section className={styles.section}>
        <Semibold>{t('MARKET_DIRECTORY.INFO_FORM.ONLINE_PRESENCE')}</Semibold>

        <Input
          label={t('MARKET_DIRECTORY.INFO_FORM.WEBSITE')}
          hookFormRegister={register(DIRECTORY_INFO_FIELDS.WEBSITE)}
          placeholder="www.url.com"
          optional
          disabled={readonly}
        />

        <SocialsInput
          icon={<InstagramIcon />}
          name={DIRECTORY_INFO_FIELDS.INSTAGRAM}
          register={register}
          disabled={readonly}
        />

        <SocialsInput
          icon={<FacebookIcon />}
          name={DIRECTORY_INFO_FIELDS.FACEBOOK}
          register={register}
          disabled={readonly}
        />

        <SocialsInput
          icon={<XIcon />}
          name={DIRECTORY_INFO_FIELDS.X}
          register={register}
          disabled={readonly}
        />
      </section>
    </div>
  );
};

export default PureMarketDirectoryInfoForm;

interface SocialsInputProps {
  icon: React.ReactNode;
  name: string;
  register: UseFormReturn['register'];
  disabled?: boolean;
}

export const SocialsInput = ({ icon, name, register, disabled }: SocialsInputProps) => {
  const { t } = useTranslation();
  return (
    <div className={styles.socialsInput}>
      <div className={styles.socialsIcon}>{icon}</div>

      <Input
        hookFormRegister={register(name)}
        placeholder={t('MARKET_DIRECTORY.INFO_FORM.AT_USERNAME')}
        disabled={disabled}
      />
    </div>
  );
};
