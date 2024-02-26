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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const options = [
    {
      label: 'Sold',
      value: 'SOLD',
    },
    {
      label: 'Slaughtered for sale',
      value: 'SLAUGHTERED_FOR_SALE',
    },
    {
      label: 'Slaughtered for consumption',
      value: 'SLAUGHTERED_FOR_CONSUMPTION',
    },
    {
      label: 'Natural Death',
      value: 'NATURAL_DEATH',
    },
    {
      label: 'Culled',
      value: 'CULLED',
    },
    {
      label: 'Other',
      value: 'OTHER',
    },
    {
      label: 'Created in Error',
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
      <Drawer title="Remove Animals" isOpen={props.isOpen} onClose={props.onClose}>
        {props.showSuccessMessage ? (
          <div className={styles.successMessage}>
            <div>
              <CheckIcon />
            </div>
            <p>
              These animals have been successfully removed from your farm and will be available in
              your historical inventory.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(props.onConfirm)}>
            {isMobile ? (
              <fieldset>
                <legend>Tell us why you are removing these animals</legend>
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
                name="reason"
                control={control}
                render={({ field }) => (
                  <ReactSelect
                    {...field}
                    // @ts-ignore
                    label="Tell us why you are removing these animals"
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
              <Input hookFormRegister={register(EXPLANATION)} label="Explanation" optional />
            )}

            {!!selectedOption &&
              (isCreatedInErrorSelected ? (
                <div className={clsx(styles.removalMessage, styles.textCenter)}>
                  <WarningIcon />
                  <p>These animals will be permanently removed from your farm</p>
                </div>
              ) : (
                <p className={styles.textCenter}>
                  These animals will be archived and accessible for future reference
                </p>
              ))}

            <div className={styles.buttonWrapper}>
              <Button color="secondary" type="button" onClick={props.onClose}>
                Cancel
              </Button>
              <Button>Confirm</Button>
            </div>
          </form>
        )}
      </Drawer>
    </>
  );
}
