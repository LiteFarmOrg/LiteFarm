import styles from './styles.module.scss';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import Form from '../Form';
import Button from '../Form/Button';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import { Main } from '../Typography';
import Select from '../Form/ReactSelect/Select';
import DateRangePicker from '../Form/DateRangePicker';
import { addDaysToDate } from '../../util/moment';

const persistedPath = ['/certification/survey'];
const progress = 33;

const CERTIFIER = 'certifier';

const PureCertificationReportingPeriod = ({
  onSubmit,
  onError,
  handleGoBack,
  persistedFormData,
  useHookFormPersist,
  certifierOptions,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      ...persistedFormData,
    },
  });

  const { historyCancel } = useHookFormPersist(getValues, persistedPath);

  return (
    <>
      <Form
        buttonGroup={
          <Button disabled={!isValid} fullLength>
            {t('common:CONTINUE')}
          </Button>
        }
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <MultiStepPageTitle
          style={{ marginBottom: '24px' }}
          onGoBack={handleGoBack}
          onCancel={historyCancel}
          title={t('CERTIFICATIONS.EXPORT_DOCS')}
          value={progress}
        />

        <Main className={styles.mainText}>{t('CERTIFICATIONS.SELECT_CERTIFICATION')}</Main>

        <Controller
          name={CERTIFIER}
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              label={t('CERTIFICATIONS.SELECT_CERTIFIER')}
              placeholder={t('CERTIFICATIONS.SELECT_CERTIFIER_PLACEHOLDER')}
              options={certifierOptions}
              value={certifierOptions.find((option) => option.value === field.value) ?? null}
              onChange={(option) => field.onChange(option?.value ?? null)}
              style={{ marginBottom: '24px' }}
            />
          )}
        />

        <Main className={styles.mainText}>{t('CERTIFICATIONS.SELECT_REPORTING_PERIOD')}</Main>

        <DateRangePicker
          register={register}
          control={control}
          getValues={getValues}
          style={{ marginBottom: '40px' }}
          fromProps={{ max: addDaysToDate(new Date(), -1, { toUTC: false }) }}
        />

        <Main className={styles.mainText}>{t('CERTIFICATIONS.NEXT_WE_WILL_CHECK')}</Main>
      </Form>
    </>
  );
};

PureCertificationReportingPeriod.propTypes = {
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  persistedFormData: PropTypes.object,
  handleGoBack: PropTypes.func,
  handleCancel: PropTypes.func,
  defaultEmail: PropTypes.string,
  certifierOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      label: PropTypes.string.isRequired,
    }),
  ),
};

PureCertificationReportingPeriod.defaultProps = {
  certifierOptions: [],
};

export default PureCertificationReportingPeriod;
