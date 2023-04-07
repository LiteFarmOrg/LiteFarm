import styles from './styles.module.scss';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import Form from '../../Form';
import Button from '../../Form/Button';
import Input, { getInputErrors } from '../../Form/Input';
import Unit from '../../Form/Unit';
import { useForm } from 'react-hook-form';
import PageTitle from '../../PageTitle/v2';
import FilterPillSelect from '../../Filter/FilterPillSelect';
import { Error } from '../../Typography';
import { harvestAmounts } from '../../../util/convert-units/unit';
import { getDateInputFormat } from '../../../util/moment';

const SaleForm = ({
  cropVarietyOptions,
  onSubmit,
  onClickDelete,
  title,
  dateLabel,
  customerLabel,
  system,
  currency,
  farm,
  sale,
}) => {
  const formatSales = sale.crop_variety_sale.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.crop_variety_id]: {
        crop_variety_id: cur.crop_variety_id,
        quantity: cur.quantity,
        quantity_unit: cur.quantity_unit,
        sale_id: cur.sale_id,
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
      default: formatSales[cvs.value] ? true : false,
      label: cvs.label,
    })),
  };
  // unique hook form names
  const { t } = useTranslation();
  const SALE_DATE = 'sale_date';
  const SALE_CUSTOMER = 'customer_name';
  const SALE_ID = 'sale_id';
  const FARM_ID = 'farm_id';
  const CHOSEN_VARIETIES = 'crop_variety_sale';
  let OTHER_VALUES = {};
  cropVarietyOptions.forEach((cv) => {
    OTHER_VALUES[cv.value] = {
      CROP_VARIETY_ID: `${CHOSEN_VARIETIES}.${cv.value}.crop_variety_id`,
      SALE_VALUE: `${CHOSEN_VARIETIES}.${cv.value}.sale_value`,
    };
  });

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      [SALE_DATE]: getDateInputFormat(sale?.sale_date) || getDateInputFormat(), //sale?.sale_date
      customer_name: sale?.customer_name,
      crop_variety_sale: formatSales,
      sale_id: sale?.sale_id,
      farm_id: sale?.farm_id,
    },
  });

  const saleDateRegister = register(SALE_DATE, { required: true });
  const saleCustomerRegister = register(SALE_CUSTOMER, { required: true });
  // FilterPillSelect does not support register yet, so const not needed
  register(CHOSEN_VARIETIES, { required: true });
  register(SALE_ID, { required: sale ?? false });
  register(FARM_ID, { required: sale ?? false });

  const [isDirty, setIsDirty] = useState(false);
  const [filterState, setFilterState] = useState(filter);
  const [isFilterValid, setIsFilterValid] = useState(true);
  const [chosenOptions, setChosenOptions] = useState([]);
  const [otherRegisters, setOtherRegisters] = useState({});

  useEffect(() => {
    const activeOptions = cropVarietyOptions.filter((cvs) =>
      formatSales[cvs.value] ? true : false,
    );
    activeOptions.length ? setIsFilterValid(true) : setIsFilterValid(false);
    let otherRegister = {};
    // Input does not support registering like Unit, dynamically register here
    activeOptions.forEach((option) => {
      otherRegister[option.value] = {
        cropVarietyIdRegister: register(OTHER_VALUES[option.value].CROP_VARIETY_ID, {
          required: true,
          value: option.value,
        }),
        saleValueRegister: register(OTHER_VALUES[option.value].SALE_VALUE, {
          required: true,
          valueAsNumber: true,
        }),
      };
    });
    setOtherRegisters(otherRegister);
    setChosenOptions(activeOptions);
  }, []);

  const onFilter = () => {
    setFilterState(filterRef.current);
    setIsDirty(!isDirty);
  };

  useEffect(() => {
    if (filterState[STATUS]) {
      const activeOptions = cropVarietyOptions.filter(
        (cvs) => filterState[STATUS][cvs.label].active,
      );
      activeOptions.length ? setIsFilterValid(true) : setIsFilterValid(false);
      let otherRegister = {};
      // Input does not support registering like Unit, dynamically register here
      activeOptions.forEach((option) => {
        otherRegister[option.value] = {
          cropVarietyIdRegister: register(OTHER_VALUES[option.value].CROP_VARIETY_ID, {
            required: true,
            value: option.value,
          }),
          saleValueRegister: register(OTHER_VALUES[option.value].SALE_VALUE, {
            required: true,
            valueAsNumber: true,
          }),
        };
      });
      setOtherRegisters(otherRegister);
      setChosenOptions(activeOptions);
    }
  }, [filterState, isDirty]);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <>
          {onClickDelete && (
            <Button color={'secondary'} fullLength onClick={onClickDelete}>
              {t('common:DELETE')}
            </Button>
          )}
          <Button disabled={!isValid} fullLength type={'submit'}>
            {t('common:SAVE')}
          </Button>
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
      />
      <Input
        label={customerLabel}
        hookFormRegister={saleCustomerRegister}
        style={{ marginBottom: '40px', marginTop: '40px' }}
        errors={getInputErrors(errors, SALE_CUSTOMER)}
        type={'text'}
      />
      <FilterPillSelect
        subject={t('SALE.ADD_SALE.CROP_VARIETY')}
        options={filter.options}
        filterKey={filter.filterKey}
        style={{ marginBottom: !isFilterValid ? '0' : '32px' }}
        filterRef={filterRef}
        key={filter.filterKey}
        onChange={onFilter}
      />
      {!isFilterValid && (
        <Error style={{ marginBottom: '32px' }}>{t('SALE.ADD_SALE.CROP_REQUIRED')}</Error>
      )}
      <hr className={styles.thinHr} />
      <div className={styles.banner}>
        <p>{t('SALE.ADD_SALE.TABLE_HEADERS.CROP_VARIETIES')}</p>
        <p>{t('SALE.ADD_SALE.TABLE_HEADERS.QUANTITY')}</p>
        <p>{`${t('SALE.ADD_SALE.TABLE_HEADERS.TOTAL')} (${currency})`}</p>
      </div>
      <hr className={styles.thinHr2} />
      {chosenOptions &&
        chosenOptions.map((c) => {
          return (
            <div className={styles.saleContainer} key={c.value}>
              <div className={styles.sale}>
                <div className={styles.leftColumn}>
                  <Input
                    value={c.label}
                    hookFormRegister={otherRegisters[c.value].cropVarietyIdRegister}
                    style={{ marginBottom: '40px' }}
                    errors={getInputErrors(errors, OTHER_VALUES[c.value].CROP_VARIETY_ID)}
                    disabled
                  />
                </div>
                <div className={styles.middleColumn}>
                  <Unit
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
                    defaultValue={formatSales[c.value].quantity}
                    from={formatSales[c.value].quantity_unit}
                  />
                </div>
                <div className={styles.rightcolumn}>
                  <Input
                    type="number"
                    hookFormRegister={otherRegisters[c.value].saleValueRegister}
                    currency={currency}
                    style={{ marginBottom: '40px' }}
                    errors={getInputErrors(errors, OTHER_VALUES[c.value].SALE_VALUE)}
                  />
                </div>
              </div>
            </div>
          );
        })}
    </Form>
  );
};

export default SaleForm;
