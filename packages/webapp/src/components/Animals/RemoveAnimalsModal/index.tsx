/*
 *  Copyright 2024 LiteFarm.org
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
import { useEffect, useMemo } from 'react';
import Drawer from '../../Drawer';
import Button from '../../Form/Button';
import ReactSelect from '../../Form/ReactSelect';
import styles from './styles.module.scss';
import { Controller, useForm, SubmitHandler } from 'react-hook-form';
import { useTheme, useMediaQuery } from '@mui/material';
import clsx from 'clsx';
import Input, { getInputErrors } from '../../Form/Input';
import { ReactComponent as WarningIcon } from '../../../assets/images/warning.svg';
import { ReactComponent as CheckIcon } from '../../../assets/images/check-circle.svg';
import { useTranslation } from 'react-i18next';
import { ClassNamesConfig } from 'react-select';
import { getLocalDateInYYYYDDMM } from '../../../util/date';
import { useGetAnimalRemovalReasonsQuery } from '../../../store/api/apiSlice';
import type { AnimalRemovalReasonKeys } from '../../../store/api/types';

const REASON = 'reason';
const EXPLANATION = 'explanation';
const DATE = 'date';

export type FormFields = {
  [REASON]: number;
  [EXPLANATION]: string;
  [DATE]: string;
};

// Does not exist in the backend table
const CREATED_IN_ERROR = 'CREATED_IN_ERROR';
const CREATED_IN_ERROR_ID = 100; // arbitrary; use any unused number except 0

type RemovalReasonsEnum = {
  [K in AnimalRemovalReasonKeys]: number;
} & { [CREATED_IN_ERROR]: number };

type RemovalOption = { label: string; value: number };

type RemoveAnimalsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: SubmitHandler<FormFields>;
  showSuccessMessage: boolean;
};

export default function RemoveAnimalsModal(props: RemoveAnimalsModalProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<FormFields>({
    mode: 'onChange',
    defaultValues: { [DATE]: getLocalDateInYYYYDDMM() },
  });
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Reset form when a new set of animals/batches is selected
  useEffect(() => {
    if (props.isOpen) {
      reset({ [DATE]: getLocalDateInYYYYDDMM() });
    }
  }, [props.isOpen]);

  const { data: apiAnimalRemovalReasons = [], isLoading } = useGetAnimalRemovalReasonsQuery();

  const RemovalReasons = useMemo(() => {
    const ReasonsEnum: { [key: string]: number } = { [CREATED_IN_ERROR]: CREATED_IN_ERROR_ID };

    apiAnimalRemovalReasons.forEach((reason) => {
      ReasonsEnum[reason.key] = reason.id;
    });

    return ReasonsEnum as RemovalReasonsEnum;
  }, [isLoading, apiAnimalRemovalReasons]);

  const options: RemovalOption[] = [
    {
      label: t('REMOVE_ANIMALS.SOLD'),
      value: RemovalReasons.SOLD,
    },
    {
      label: t('REMOVE_ANIMALS.SLAUGHTERED_FOR_SALE'),
      value: RemovalReasons.SLAUGHTERED_FOR_SALE,
    },
    {
      label: t('REMOVE_ANIMALS.SLAUGHTERED_FOR_CONSUMPTION'),
      value: RemovalReasons.SLAUGHTERED_FOR_CONSUMPTION,
    },
    {
      label: t('REMOVE_ANIMALS.NATURAL_DEATH'),
      value: RemovalReasons.NATURAL_DEATH,
    },
    {
      label: t('REMOVE_ANIMALS.CULLED'),
      value: RemovalReasons.CULLED,
    },
    {
      label: t('common:OTHER'),
      value: RemovalReasons.OTHER,
    },
    {
      label: t('REMOVE_ANIMALS.CREATED_IN_ERROR'),
      value: RemovalReasons.CREATED_IN_ERROR,
    },
  ];

  const selectedOption = watch(REASON);
  const isCreatedInError = (value: number) => value === RemovalReasons.CREATED_IN_ERROR;

  return (
    <>
      {/* @ts-ignore */}
      <Drawer
        title={t('REMOVE_ANIMALS.REMOVE_ANIMALS')}
        isOpen={props.isOpen}
        onClose={props.onClose}
      >
        {props.showSuccessMessage ? (
          <div className={styles.successMessage}>
            <div>
              <CheckIcon />
            </div>
            <p>{t('REMOVE_ANIMALS.REMOVED_AND_ARCHIVED')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(props.onConfirm)}>
            {isMobile ? (
              <fieldset>
                <legend>{t('REMOVE_ANIMALS.WHY')}</legend>
                {options.map(({ label, value }) => (
                  <label key={value} className={styles.mobileOption}>
                    <input {...register(REASON)} value={value} type="radio" />
                    <div
                      className={clsx(
                        styles.mobileOptionLabel,
                        isCreatedInError(value)
                          ? styles.mobileOptionLabelRed
                          : styles.mobileOptionLabelGreen,
                      )}
                    >
                      {label}
                    </div>
                  </label>
                ))}
              </fieldset>
            ) : (
              <Controller
                name={REASON}
                control={control}
                render={({ field }) => (
                  <ReactSelect
                    {...field}
                    // @ts-ignore
                    label={t('REMOVE_ANIMALS.WHY')}
                    placeholder={t('REMOVE_ANIMALS.REMOVAL_REASONS')}
                    value={options.find(({ value }) => value === field.value)}
                    options={options}
                    onChange={(option: RemovalOption) => field.onChange(option.value)}
                    className={styles.reactSelect}
                    classNames={
                      {
                        // @ts-ignore
                        option: ({ value }) =>
                          clsx(
                            styles.dropDownOption,
                            isCreatedInError(value)
                              ? styles.dropDownOptionRed
                              : styles.dropDownOptionGreen,
                          ),
                        placeholder: ({ isFocused }) => (isFocused ? styles.placeholderHidden : ''),
                        menuList: () => styles.dropDownList,
                        valueContainer: (state) =>
                          isCreatedInError(state.getValue()[0]?.value) ? styles.textRed : '',
                      } satisfies ClassNamesConfig<RemovalOption>
                    }
                  />
                )}
              />
            )}

            {!isCreatedInError(selectedOption) && (
              /* @ts-ignore */
              <Input
                type={'date'}
                label={t('common:DATE')}
                hookFormRegister={register(DATE, {
                  required: true,
                  shouldUnregister: true,
                })}
                errors={getInputErrors(errors, DATE)}
              />
            )}

            {!!selectedOption &&
              (isCreatedInError(selectedOption) ? (
                <div className={clsx(styles.removalMessage)}>
                  <WarningIcon />
                  <p>{t('REMOVE_ANIMALS.WILL_BE_PERMANENTLY_REMOVED')}</p>
                </div>
              ) : (
                <>
                  {/*@ts-ignore*/}
                  <Input
                    hookFormRegister={register(EXPLANATION)}
                    label={t('REMOVE_ANIMALS.EXPLANATION')}
                    placeholder={t('REMOVE_ANIMALS.MORE_DETAILS')}
                    optional
                  />
                  <p className={styles.archivedMessage}>{t('REMOVE_ANIMALS.WILL_BE_ARCHIVED')}</p>
                </>
              ))}

            <div className={styles.buttonWrapper}>
              <Button color="secondary" type="button" onClick={props.onClose}>
                {t('common:CANCEL')}
              </Button>
              <Button disabled={!selectedOption || !isValid}>{t('common:CONFIRM')}</Button>
            </div>
          </form>
        )}
      </Drawer>
    </>
  );
}
