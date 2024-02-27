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

  const options = [
    {
      label: t('REMOVE_ANIMALS.SOLD'),
      value: 'SOLD',
    },
    {
      label: t('REMOVE_ANIMALS.SLAUGHTERED_FOR_SALE'),
      value: 'SLAUGHTERED_FOR_SALE',
    },
    {
      label: t('REMOVE_ANIMALS.SLAUGHTERED_FOR_CONSUMPTION'),
      value: 'SLAUGHTERED_FOR_CONSUMPTION',
    },
    {
      label: t('REMOVE_ANIMALS.NATURAL_DEATH'),
      value: 'NATURAL_DEATH',
    },
    {
      label: t('REMOVE_ANIMALS.CULLED'),
      value: 'CULLED',
    },
    {
      label: t('common:OTHER'),
      value: 'OTHER',
    },
    {
      label: t('REMOVE_ANIMALS.CREATED_IN_ERROR'),
      value: 'CREATED_IN_ERROR',
    },
  ];

  const selectedOption = watch(REASON);
  const isCreatedInErrorSelected = selectedOption === options[options.length - 1].value;

  // For styling dropdown options
  const getReactSelectClassNames = (value: string) => {
    if (!value) return '';
    return clsx(
      styles.dropDownOption,
      value === options[options.length - 1].value
        ? styles.dropDownOptionRed
        : styles.dropDownOptionGreen,
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
                        value === options[options.length - 1].value
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

            {!!selectedOption && !isCreatedInErrorSelected && (
              // @ts-ignore
              <Input
                hookFormRegister={register(EXPLANATION)}
                label={t('REMOVE_ANIMALS.EXPLANATION')}
                optional
              />
            )}

            {!!selectedOption &&
              (isCreatedInErrorSelected ? (
                <div className={clsx(styles.removalMessage, styles.textCenter)}>
                  <WarningIcon />
                  <p>{t('REMOVE_ANIMALS.WILL_BE_PERMANENTLY_REMOVED')}</p>
                </div>
              ) : (
                <p className={styles.textCenter}>{t('REMOVE_ANIMALS.WILL_BE_ARCHIVED')}</p>
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
