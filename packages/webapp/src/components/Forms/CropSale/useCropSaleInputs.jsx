import { useState, useRef, useEffect, useMemo } from 'react';
import { CHOSEN_VARIETIES, CROP_VARIETY_ID, SALE_VALUE } from '../GeneralRevenue/constants';
import PureManagementPlanTile from '../../CropTile/ManagementPlanTile';
import FilterPillSelect from '../../Filter/FilterPillSelect';
import { Error } from '../../Typography';
import Unit from '../../Form/Unit';
import Input, { getInputErrors } from '../../Form/Input';
import { STATUS } from '../GeneralRevenue/constants';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { harvestAmounts } from '../../../util/convert-units/unit';
import { revenueFormTypes } from '../../../containers/Finances/constants';
import { useSelector } from 'react-redux';
import { currentAndPlannedManagementPlansSelector } from '../../../containers/managementPlanSlice';
import { measurementSelector } from '../../../containers/userFarmSlice';

export const getCustomFormChildrenDefaultValues = (sale) => {
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
  return {
    [CHOSEN_VARIETIES]: existingSales ?? undefined,
  };
};

// const getInputs = (activeOptions, managementPlans, reactHookFormFunctions, system, currency, disabledInput, dynamicRegister, dynamicRegisterNames, t ) => {
//     const {control, register, getValues, setValue, watch, formState: {errors}} = reactHookFormFunctions;
//     return activeOptions.map((c) => {
//         const managementPlan = managementPlans.find((mp) => mp.crop_variety_id == c.value);
//         return (
//         <div
//             key={c.label}
//             className={styles.saleDetails}
//             style={{ marginTop: '32px', marginBottom: '32px' }}
//         >
//             <PureManagementPlanTile
//             key={managementPlan.management_plan_id}
//             managementPlan={managementPlan}
//             date={managementPlan.firstTaskDate}
//             status={managementPlan.status}
//             />
//             <div className={styles.saleInputs}>
//             <Unit
//                 label={t('SALE.ADD_SALE.TABLE_HEADERS.QUANTITY')}
//                 register={register}
//                 name={`${CHOSEN_VARIETIES}.${c.value}.quantity`}
//                 displayUnitName={`${CHOSEN_VARIETIES}.${c.value}.quantity_unit`}
//                 unitType={harvestAmounts}
//                 system={system}
//                 hookFormSetValue={setValue}
//                 hookFormGetValue={getValues}
//                 hookFromWatch={watch}
//                 control={control}
//                 style={{ marginBottom: '40px' }}
//                 required
//                 disabled={disabledInput}
//             />
//             <Input
//                 label={`${t('SALE.ADD_SALE.TABLE_HEADERS.TOTAL')} (${currency})`}
//                 type="number"
//                 hookFormRegister={dynamicRegister[c.value].saleValueRegister}
//                 currency={currency}
//                 style={{ marginBottom: '40px' }}
//                 errors={getInputErrors(errors, dynamicRegisterNames[c.value].SALE_VALUE)}
//                 disabled={disabledInput}
//             />
//             </div>
//         </div>
//         );
//     });
// }

export const useCropSaleInputs = (
  reactHookFormFunctions,
  formType,
  sale,
  currency,
  disabledInput,
  view,
) => {
  const {
    register,
    unregister,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = reactHookFormFunctions;
  const { t } = useTranslation();

  const managementPlans = useSelector(currentAndPlannedManagementPlansSelector) || [];
  const system = useSelector(measurementSelector);
  //LF-3595
  const isCropSale = formType === revenueFormTypes.CROP_SALE;
  // // Reformat selector to match component format
  // const existingSales = sale?.crop_variety_sale?.reduce(
  //     (acc, cur) => ({
  //         ...acc,
  //         [cur.crop_variety_id]: {
  //         crop_variety_id: cur.crop_variety_id,
  //         quantity: cur.quantity,
  //         quantity_unit: cur.quantity_unit,
  //         sale_value: cur.sale_value,
  //         },
  //     }),
  //     {},
  //     );

  register(CHOSEN_VARIETIES, { required: formType === revenueFormTypes.CROP_SALE ? true : false });

  const getCropVarietyOptions = () => {
    if (!managementPlans || managementPlans.length === 0) {
      return [];
    }

    let cropVarietyOptions = [];
    let cropVarietySet = new Set();

    for (let mp of managementPlans) {
      if (!cropVarietySet.has(mp.crop_variety_id)) {
        cropVarietyOptions.push({
          label: mp.crop_variety_name
            ? `${mp.crop_variety_name}, ${t(`crop:${mp.crop_translation_key}`)}`
            : t(`crop:${mp.crop_translation_key}`),
          value: mp.crop_variety_id,
        });
        cropVarietySet.add(mp.crop_variety_id);
      }
    }

    cropVarietyOptions.sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

    return cropVarietyOptions;
  };

  const getInputs = (activeOptions, dynamicRegister, dynamicRegisterNames) => {
    return activeOptions.map((c) => {
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
              hookFormRegister={dynamicRegister[c.value].saleValueRegister}
              currency={currency}
              style={{ marginBottom: '40px' }}
              errors={getInputErrors(errors, dynamicRegisterNames[c.value].SALE_VALUE)}
              disabled={disabledInput}
            />
          </div>
        </div>
      );
    });
  };

  // If not memoized - infinte re-render
  const cropVarietyOptions = useMemo(() => {
    return getCropVarietyOptions(managementPlans);
  }, [managementPlans]);

  // Reformat selector to match component format
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
  // TODO: match component to selector format
  // const existingSales = useMemo(() => {
  //     return sale?.crop_variety_sale?.reduce(
  //     (acc, cur) => ({
  //         ...acc,
  //         [cur.crop_variety_id]: {
  //         crop_variety_id: cur.crop_variety_id,
  //         quantity: cur.quantity,
  //         quantity_unit: cur.quantity_unit,
  //         sale_value: cur.sale_value,
  //         },
  //     }),
  //     {},
  //     );
  // }, [sale]);

  // FilterPillSelect details
  const filterRef = useRef({});
  const filter = useMemo(() => {
    return {
      filterKey: STATUS,
      options: cropVarietyOptions.map((cvs) => ({
        value: cvs.label,
        default: existingSales?.[cvs.value] ? true : false,
        label: cvs.label,
      })),
    };
  }, [cropVarietyOptions, existingSales]);

  const [isDirty, setIsDirty] = useState(false);
  const [filterState, setFilterState] = useState({});
  const [isFilterValid, setIsFilterValid] = useState(true);
  const [fields, setFields] = useState(null);

  // Run once and do not assess filter validity -- needed for edit sale
  useEffect(() => {
    if (existingSales) {
      //register(CHOSEN_VARIETIES, { required: formType === revenueFormTypes.CROP_SALE ? true : false, value: existingSales } );
      const activeOptions = cropVarietyOptions.filter((cvs) =>
        existingSales?.[cvs.value] ? true : false,
      );

      activeOptions.length ?? setIsFilterValid(true);
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
      const renderedFields = getInputs(activeOptions, dynamicRegister, dynamicRegisterNames);
      setFields(renderedFields);
    }
  }, []);

  useEffect(() => {
    setFilterState(filterRef.current);
  }, [disabledInput]);

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
      const inactiveOptions = cropVarietyOptions.filter(
        (cvs) => !filterState[STATUS][cvs.label].active,
      );
      let dynamicRegisterNames = {};
      let dynamicRegister = {};

      activeOptions.length ? setIsFilterValid(true) : setIsFilterValid(false);

      activeOptions.forEach((option) => {
        const optionRegisterNames = {
          CROP_VARIETY_ID: `${CHOSEN_VARIETIES}.${option.value}.crop_variety_id`,
          SALE_VALUE: `${CHOSEN_VARIETIES}.${option.value}.sale_value`,
          CHOSEN_VARIETY: `${CHOSEN_VARIETIES}.${option.value}`,
        };
        register(optionRegisterNames.CHOSEN_VARIETY, { required: true });
        dynamicRegisterNames[option.value] = optionRegisterNames;
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
      });
      inactiveOptions.forEach((option) => {
        const optionRegisterNames = {
          CROP_VARIETY_ID: `${CHOSEN_VARIETIES}.${option.value}.crop_variety_id`,
          SALE_VALUE: `${CHOSEN_VARIETIES}.${option.value}.sale_value`,
          QUANTITY: `${CHOSEN_VARIETIES}.${option.value}.quantity`,
          QUANTITY_UNIT: `${CHOSEN_VARIETIES}.${option.value}.quantity_unit`,
          CHOSEN_VARIETY: `${CHOSEN_VARIETIES}.${option.value}`,
        };

        //unregister(optionRegisterNames.CHOSEN_VARIETY);
        unregister([
          optionRegisterNames.SALE_VALUE,
          optionRegisterNames.QUANTITY,
          optionRegisterNames.QUANTITY_UNIT,
          optionRegisterNames.CROP_VARIETY_ID,
          optionRegisterNames.CHOSEN_VARIETY,
        ]);
        // unregister(optionRegisterNames.SALE_VALUE);
        // unregister(optionRegisterNames.QUANTITY);
        // unregister(optionRegisterNames.QUANTITY_UNIT);
        // unregister(optionRegisterNames.CHOSEN_VARIETY);
      });

      // if(!activeOptions.length){
      //     unregister(CHOSEN_VARIETIES, { required: true, value: {} });
      // }
      activeOptions.length ? setIsFilterValid(true) : setIsFilterValid(false);

      // let renderedFields = activeOptions.map((c) => {
      //     const managementPlan = managementPlans.find((mp) => mp.crop_variety_id == c.value);
      //     return (
      //     <div
      //         key={c.label}
      //         className={styles.saleDetails}
      //         style={{ marginTop: '32px', marginBottom: '32px' }}
      //     >
      //         <PureManagementPlanTile
      //         key={managementPlan.management_plan_id}
      //         managementPlan={managementPlan}
      //         date={managementPlan.firstTaskDate}
      //         status={managementPlan.status}
      //         />
      //         <div className={styles.saleInputs}>
      //         <Unit
      //             label={t('SALE.ADD_SALE.TABLE_HEADERS.QUANTITY')}
      //             register={register}
      //             name={`${CHOSEN_VARIETIES}.${c.value}.quantity`}
      //             displayUnitName={`${CHOSEN_VARIETIES}.${c.value}.quantity_unit`}
      //             unitType={harvestAmounts}
      //             system={system}
      //             hookFormSetValue={setValue}
      //             hookFormGetValue={getValues}
      //             hookFromWatch={watch}
      //             control={control}
      //             style={{ marginBottom: '40px' }}
      //             required
      //             disabled={disabledInput}
      //         />
      //         <Input
      //             label={`${t('SALE.ADD_SALE.TABLE_HEADERS.TOTAL')} (${currency})`}
      //             type="number"
      //             hookFormRegister={dynamicRegister[c.value].saleValueRegister}
      //             currency={currency}
      //             style={{ marginBottom: '40px' }}
      //             errors={getInputErrors(errors, dynamicRegisterNames[c.value].SALE_VALUE)}
      //             disabled={disabledInput}
      //         />
      //         </div>
      //     </div>
      //     );
      // })
      const renderedFields = getInputs(activeOptions, dynamicRegister, dynamicRegisterNames);
      setFields(renderedFields);
    }
  }, [cropVarietyOptions, filterState, isDirty, managementPlans, disabledInput, view]);

  return isCropSale ? (
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
      <hr className={styles.thinHr} />
      {fields}
    </>
  ) : null;
};
