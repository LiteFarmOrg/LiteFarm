import styles from './styles.module.scss';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { Controller } from 'react-hook-form';
import ReactSelect from '../../Form/ReactSelect';
import Button from '../../Form/Button';
import Input, { getInputErrors } from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import Unit from '../../Form/Unit';
import PureManagementPlanTile from '../../CropTile/ManagementPlanTile';
import { useForm } from 'react-hook-form';
import PageTitle from '../../PageTitle/v2';
import FilterPillSelect from '../../Filter/FilterPillSelect';
import { Error } from '../../Typography';
import { harvestAmounts } from '../../../util/convert-units/unit';
import { hookFormMaxCharsValidation } from '../../Form/hookformValidationUtils';
import { revenueFormTypes } from '../../../containers/Finances/constants';
import { getLocalDateInYYYYDDMM } from '../../../util/date';

const CropSaleForm = ({
  cropVarietyOptions,
  revenueTypeOptions,
  onSubmit,
  onClick,
  onClickDelete,
  title,
  dateLabel,
  customerLabel,
  system,
  currency,
  sale,
  managementPlans,
  view,
  onTypeChange,
  formType,
  useHookFormPersist,
  persistedFormData,
  buttonText,
}) => {
  // Reformat selector to match component format
  // TODO: match component to selector format
  const existingSales = sale?.crop_variety_sale?.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.crop_variety_id]: {
        crop_variety_id: cur.crop_variety_id,
        quantity: cur.quantity,
        quantity_unit: cur.quantity_unit,
        sale_value: cur.sale_value,
      },
    }),
    {},
  );
  // FilterPillSelect details
  const STATUS = 'STATUS';
  const filterRef = useRef({});
  const filter = {
    filterKey: STATUS,
    options: cropVarietyOptions.map((cvs) => ({
      value: cvs.label,
      default: existingSales?.[cvs.value] ? true : false,
      label: cvs.label,
    })),
  };
  // Unique hook form names
  const { t } = useTranslation();
  const SALE_DATE = 'sale_date';
  const SALE_CUSTOMER = 'customer_name';
  const REVENUE_TYPE = 'revenue_type';
  const REVENUE_TYPE_ID = 'revenue_type_id';
  const CHOSEN_VARIETIES = 'crop_variety_sale';
  const NOTE = 'note';
  const VALUE = 'value';

  const {
    register,
    unregister,
    handleSubmit,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      [SALE_DATE]:
        (sale?.[SALE_DATE] && getLocalDateInYYYYDDMM(new Date(sale[SALE_DATE]))) ||
        persistedFormData?.[SALE_DATE] ||
        getLocalDateInYYYYDDMM(),
      [SALE_CUSTOMER]: sale?.[SALE_CUSTOMER] || persistedFormData?.[SALE_CUSTOMER] || '',
      [REVENUE_TYPE_ID]: revenueTypeOptions.find(
        (option) => option.value === sale?.revenue_type_id,
      ),
      [CHOSEN_VARIETIES]: existingSales ?? undefined,
      [NOTE]: sale?.[NOTE] || persistedFormData?.[NOTE] || '',
      [VALUE]: !isNaN(sale?.[VALUE])
        ? sale[VALUE]
        : !isNaN(persistedFormData?.[VALUE])
        ? persistedFormData[VALUE]
        : null,
    },
  });

  useHookFormPersist(getValues);

  const saleDateRegister = register(SALE_DATE, { required: true });
  const saleCustomerRegister = register(SALE_CUSTOMER, { required: true });
  // FilterPillSelect does not support register yet, so const definition not needed
  register(CHOSEN_VARIETIES, { required: formType === revenueFormTypes.GENERAL ? false : true });

  const [isDirty, setIsDirty] = useState(false);
  const [filterState, setFilterState] = useState({});
  const [isFilterValid, setIsFilterValid] = useState(true);
  const [chosenOptions, setChosenOptions] = useState([]);
  const [cropVarietyRegisterNames, setCropVarietyRegisterNames] = useState({});
  const [cropVarietyRegisters, setCropVarietyRegisters] = useState({});

  const readonly = view === 'read-only';
  const disabledInput = readonly;
  const disabledButton = !isValid && !readonly;
  //const disabledButton = (!isValid || !isDirty) && !readonly;

  // Run once and do not assess filter validity -- needed for edit sale
  useEffect(() => {
    const activeOptions = cropVarietyOptions.filter((cvs) =>
      existingSales?.[cvs.value] ? true : false,
    );
    (activeOptions.length || formType === revenueFormTypes.GENERAL) ?? setIsFilterValid(true);
    // Input does not support registering like Unit, dynamically register here
    let dynamicRegisterNames = {};
    let dynamicRegister = {};
    activeOptions.forEach((option) => {
      dynamicRegisterNames[option.value] = {
        CROP_VARIETY_ID: `${CHOSEN_VARIETIES}.${option.value}.crop_variety_id`,
        SALE_VALUE: `${CHOSEN_VARIETIES}.${option.value}.sale_value`,
      };
      dynamicRegister[option.value] = {
        cropVarietyIdRegister: register(dynamicRegisterNames[option.value].CROP_VARIETY_ID, {
          required: true,
          value: option.value,
        }),
        saleValueRegister: register(dynamicRegisterNames[option.value].SALE_VALUE, {
          required: true,
          valueAsNumber: true,
        }),
      };
    });
    setCropVarietyRegisterNames(dynamicRegisterNames);
    setCropVarietyRegisters(dynamicRegister);
    setChosenOptions(activeOptions);
  }, []);

  // From FilterPillSelect
  const onFilter = () => {
    setFilterState(filterRef.current);
    setIsDirty(!isDirty);
  };

  useEffect(() => {
    if (filterState[STATUS]) {
      const activeOptions = cropVarietyOptions.filter(
        (cvs) => filterState[STATUS][cvs.label].active,
      );
      let dynamicRegisterNames = {};
      let dynamicRegister = {};
      activeOptions.length || formType === revenueFormTypes.GENERAL
        ? setIsFilterValid(true)
        : setIsFilterValid(false);
      // Input does not support registering like Unit, dynamically register here
      cropVarietyOptions.forEach((option) => {
        const isActive = filterState[STATUS][option.label].active;
        const optionRegisterNames = {
          CROP_VARIETY_ID: `${CHOSEN_VARIETIES}.${option.value}.crop_variety_id`,
          SALE_VALUE: `${CHOSEN_VARIETIES}.${option.value}.sale_value`,
        };
        dynamicRegisterNames[option.value] = optionRegisterNames;
        if (isActive) {
          dynamicRegister[option.value] = {
            cropVarietyIdRegister: register(optionRegisterNames.CROP_VARIETY_ID, {
              required: true,
              value: option.value,
            }),
            saleValueRegister: register(optionRegisterNames.SALE_VALUE, {
              required: true,
              valueAsNumber: true,
              min: { value: 0, message: t('SALE.ADD_SALE.SALE_VALUE_ERROR') },
              max: { value: 999999999, message: t('SALE.ADD_SALE.SALE_VALUE_ERROR') },
            }),
          };
        } else {
          unregister(optionRegisterNames.CROP_VARIETY_ID);
          unregister(optionRegisterNames.SALE_VALUE);
        }
      });
      setCropVarietyRegisterNames(dynamicRegisterNames);
      setCropVarietyRegisters(dynamicRegister);
      setChosenOptions(activeOptions);
    }
  }, [cropVarietyOptions, filterState, isDirty, register, t, unregister]);

  // Separating these into separate vs prop rendered nodes prevents form submission onClick for noSubmitButton
  const noSubmitButton = (
    <Button
      color={'secondary'}
      fullLength
      disabled={disabledButton}
      onClick={onClick}
      type={'button'}
    >
      {' '}
      {buttonText}
    </Button>
  );
  const submitButton = (
    <Button color={'primary'} fullLength disabled={disabledButton} type={'submit'}>
      {' '}
      {buttonText}
    </Button>
  );

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <>
          {onClick && noSubmitButton}
          {onSubmit && submitButton}
        </>
      }
    >
      <PageTitle title={title} onGoBack={() => history.back()} style={{ marginBottom: '24px' }} />
      <Input
        label={dateLabel}
        hookFormRegister={saleDateRegister}
        style={{ marginBottom: '40px', marginTop: '40px' }}
        type={'date'}
        errors={getInputErrors(errors, SALE_DATE)}
        disabled={disabledInput}
      />
      <Input
        label={customerLabel}
        hookFormRegister={saleCustomerRegister}
        style={{ marginBottom: '40px' }}
        errors={getInputErrors(errors, SALE_CUSTOMER)}
        type={'text'}
        disabled={disabledInput}
      />
      {view != 'add' && (
        <Controller
          control={control}
          name={REVENUE_TYPE_ID}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <ReactSelect
              data-cy="cropSaleForm-typeSelect"
              label={t('REVENUE.EDIT_REVENUE.REVENUE_TYPE')}
              options={revenueTypeOptions}
              style={{ marginBottom: '40px' }}
              onChange={(e) => {
                onTypeChange(e.value);
                onChange(e);
              }}
              value={value}
              isDisabled={disabledInput}
            />
          )}
        />
      )}
      {formType === revenueFormTypes.CROP_SALE && (
        <>
          <FilterPillSelect
            subject={t('SALE.ADD_SALE.CROP_VARIETY')}
            options={filter.options}
            filterKey={filter.filterKey}
            style={{ marginBottom: !isFilterValid ? '0' : '32px' }}
            filterRef={filterRef}
            key={filter.filterKey}
            onChange={onFilter}
            isDisabled={disabledInput}
          />
          {!isFilterValid && (
            <Error style={{ marginBottom: '32px' }}>{t('SALE.ADD_SALE.CROP_REQUIRED')}</Error>
          )}
        </>
      )}
      {formType === revenueFormTypes.GENERAL && (
        <Input
          label={t('SALE.DETAIL.VALUE')}
          type="number"
          hookFormRegister={register(VALUE, { required: true, valueAsNumber: true })}
          currency={currency}
          style={{ marginBottom: '40px' }}
          errors={getInputErrors(errors, VALUE)}
          disabled={disabledInput}
        />
      )}
      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('LOG_COMMON.NOTES')}
        optional={true}
        hookFormRegister={register(NOTE, { maxLength: hookFormMaxCharsValidation(10000) })}
        name={NOTE}
        errors={getInputErrors(errors, NOTE)}
        disabled={disabledInput}
      />
      {formType === revenueFormTypes.CROP_SALE && <hr className={styles.thinHr} />}
      {formType === revenueFormTypes.CROP_SALE &&
        chosenOptions &&
        chosenOptions.map((c) => {
          const managementPlan = managementPlans.find((mp) => mp.crop_variety_id == c.value);
          return (
            <div
              key={c.label}
              className={styles.saleDetails}
              style={{ marginTop: '32px', marginBottom: '32px' }}
            >
              <PureManagementPlanTile
                key={managementPlan.management_plan_id}
                managementPlan={managementPlan}
                date={managementPlan.firstTaskDate}
                status={managementPlan.status}
              />
              <div className={styles.saleInputs}>
                <Unit
                  label={t('SALE.ADD_SALE.TABLE_HEADERS.QUANTITY')}
                  register={register}
                  name={`${CHOSEN_VARIETIES}.${c.value}.quantity`}
                  displayUnitName={`${CHOSEN_VARIETIES}.${c.value}.quantity_unit`}
                  unitType={harvestAmounts}
                  system={system}
                  hookFormSetValue={setValue}
                  hookFormGetValue={getValues}
                  hookFromWatch={watch}
                  control={control}
                  style={{ marginBottom: '40px' }}
                  required
                  disabled={disabledInput}
                />
                <Input
                  label={`${t('SALE.ADD_SALE.TABLE_HEADERS.TOTAL')} (${currency})`}
                  type="number"
                  hookFormRegister={cropVarietyRegisters[c.value].saleValueRegister}
                  currency={currency}
                  style={{ marginBottom: '40px' }}
                  errors={getInputErrors(errors, cropVarietyRegisterNames[c.value].SALE_VALUE)}
                  disabled={disabledInput}
                />
              </div>
            </div>
          );
        })}
    </Form>
  );
};

export default CropSaleForm;
