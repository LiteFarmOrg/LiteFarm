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

import Drawer from '../../Drawer';
import Button from '../../Form/Button';
import ReactSelect from '../../Form/ReactSelect';
import styles from './styles.module.scss';
import { Controller, useForm, SubmitHandler } from 'react-hook-form';
import { useTheme, useMediaQuery } from '@mui/material';
import clsx from 'clsx';
import Input from '../../Form/Input';
import { ReactComponent as WarningIcon } from '../../../assets/images/warning.svg';
import { ReactComponent as CheckIcon } from '../../../assets/images/check-circle.svg';
import { useTranslation } from 'react-i18next';

const REASON = 'reason';
const EXPLANATION = 'explanation';

type FormFields = {
  [REASON]: string;
  [EXPLANATION]: string;
};

enum RemovalOptionValue {
  SOLD = 'SOLD',
  SLAUGHTERED_FOR_SALE = 'SLAUGHTERED_FOR_SALE',
  SLAUGHTERED_FOR_CONSUMPTION = 'SLAUGHTERED_FOR_CONSUMPTION',
  NATURAL_DEATH = 'NATURAL_DEATH',
  CULLED = 'CULLED',
  OTHER = 'OTHER',
  CREATED_IN_ERROR = 'CREATED_IN_ERROR',
}

type RemovalOption = { label: string; value: RemovalOptionValue };

type RemoveAnimalsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: SubmitHandler<FormFields>;
  showSuccessMessage: boolean;
};

export default function RemoveAnimalsModal(props: RemoveAnimalsModalProps) {
  const { register, handleSubmit, control, watch } = useForm<FormFields>();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const options: RemovalOption[] = [
    {
      label: t('REMOVE_ANIMALS.SOLD'),
      value: RemovalOptionValue.SOLD,
    },
    {
      label: t('REMOVE_ANIMALS.SLAUGHTERED_FOR_SALE'),
      value: RemovalOptionValue.SLAUGHTERED_FOR_SALE,
    },
    {
      label: t('REMOVE_ANIMALS.SLAUGHTERED_FOR_CONSUMPTION'),
      value: RemovalOptionValue.SLAUGHTERED_FOR_CONSUMPTION,
    },
    {
      label: t('REMOVE_ANIMALS.NATURAL_DEATH'),
      value: RemovalOptionValue.NATURAL_DEATH,
    },
    {
      label: t('REMOVE_ANIMALS.CULLED'),
      value: RemovalOptionValue.CULLED,
    },
    {
      label: t('common:OTHER'),
      value: RemovalOptionValue.OTHER,
    },
    {
      label: t('REMOVE_ANIMALS.CREATED_IN_ERROR'),
      value: RemovalOptionValue.CREATED_IN_ERROR,
    },
  ];

  const selectedOption = watch(REASON);
  const isCreatedInError = (value: string) => value === RemovalOptionValue.CREATED_IN_ERROR;

  // For styling dropdown options
  const getReactSelectClassNames = (value: string) => {
    if (!value) return '';
    return clsx(
      styles.dropDownOption,
      isCreatedInError(value) ? styles.dropDownOptionRed : styles.dropDownOptionGreen,
    );
  };

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
                    classNames={{
                      // @ts-ignore
                      option: ({ value }) => getReactSelectClassNames(value),
                      // @ts-ignore
                      valueContainer: (state) =>
                        getReactSelectClassNames(state.getValue()[0]?.value),
                    }}
                    // @ts-ignore
                    value={options.find(({ value }) => value === field.value)}
                    options={options}
                    onChange={(option: (typeof options)[0]) => field.onChange(option.value)}
                  />
                )}
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
                    optional
                  />
                  <p className={styles.archivedMessage}>{t('REMOVE_ANIMALS.WILL_BE_ARCHIVED')}</p>
                </>
              ))}

            <div className={styles.buttonWrapper}>
              <Button color="secondary" type="button" onClick={props.onClose}>
                {t('common:CANCEL')}
              </Button>
              <Button>{t('common:CONFIRM')}</Button>
            </div>
          </form>
        )}
      </Drawer>
    </>
  );
}
