import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ReactComponent as OtherIcon } from '../../../../assets/images/finance/Custom-expense.svg';
import { ReactComponent as EquipIcon } from '../../../../assets/images/finance/Equipment-icn.svg';
import { ReactComponent as FuelIcon } from '../../../../assets/images/finance/Fuel-icn.svg';
import { ReactComponent as InfrastructureIcon } from '../../../../assets/images/finance/Infrastructure-icn.svg';
import { ReactComponent as LabourIcon } from '../../../../assets/images/finance/Labour-icn.svg';
import { ReactComponent as LandIcon } from '../../../../assets/images/finance/Land-icn.svg';
import { ReactComponent as MachineIcon } from '../../../../assets/images/finance/Machinery-icn.svg';
import { ReactComponent as MiscellaneousIcon } from '../../../../assets/images/finance/Miscellaneous-icn.svg';
import { ReactComponent as PestIcon } from '../../../../assets/images/finance/Pest-icn.svg';
import { ReactComponent as SeedIcon } from '../../../../assets/images/finance/Seeds-icn.svg';
import { ReactComponent as ServicesIcon } from '../../../../assets/images/finance/Services-icn.svg';
import { ReactComponent as SoilAmendmentIcon } from '../../../../assets/images/finance/Soil-amendment-icn.svg';
import { ReactComponent as TransportationIcon } from '../../../../assets/images/finance/Transportation-icn.svg';
import { ReactComponent as UtilitiesIcon } from '../../../../assets/images/finance/Utilities-icn.svg';
import PureFinanceTypeSelection from '../../../../components/Finances/PureFinanceTypeSelection';
import { listItemTypes } from '../../../../components/List/constants';
import labelIconStyles from '../../../../components/Tile/styles.module.scss';
import { useGetNonRetiredExpenseTypesQuery } from '../../../../hooks/api/expenseTypesQueries';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { setSelectedExpenseTypes } from '../../actions';
import { selectedExpenseSelector, sortExpenseTypes } from '../../selectors';
import { getFinanceTypeSearchableStringFunc } from '../../util';
import ManageCustomExpenseTypesSpotlight from '../ManageCustomExpenseTypesSpotlight';

export const icons = {
  EQUIPMENT: <EquipIcon />,
  SOIL_AMENDMENT: <SoilAmendmentIcon />,
  PEST_CONTROL: <PestIcon />,
  FUEL: <FuelIcon />,
  MACHINERY: <MachineIcon />,
  SEEDS_AND_PLANTS: <SeedIcon />,
  OTHER: <OtherIcon />,
  LAND: <LandIcon />,
  MISCELLANEOUS: <MiscellaneousIcon />,
  UTILITIES: <UtilitiesIcon />,
  LABOUR: <LabourIcon />,
  INFRASTRUCTURE: <InfrastructureIcon />,
  TRANSPORTATION: <TransportationIcon />,
  SERVICES: <ServicesIcon />,
};

const ExpenseCategories = ({ history }) => {
  const [selectedTypes, setSelectedTypes] = useState(useSelector(selectedExpenseSelector));
  const { data } = useGetNonRetiredExpenseTypesQuery();
  const expenseTypes = sortExpenseTypes(data);

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const nextPage = (event) => {
    event.preventDefault();
    dispatch(setSelectedExpenseTypes(selectedTypes));
    history.push('/add_expense');
  };

  const addRemoveType = (id) => {
    const newSelectedTypes = [...selectedTypes];
    if (selectedTypes.includes(id)) {
      const index = newSelectedTypes.indexOf(id);
      newSelectedTypes.splice(index, 1);
    } else {
      newSelectedTypes.push(id);
    }
    setSelectedTypes(newSelectedTypes);
  };

  const miscellaneous_type_id = expenseTypes.find(
    (expenseType) => expenseType.expense_translation_key == 'MISCELLANEOUS',
  ).expense_type_id;

  // Do not display miscellaneous as a visible tile
  const filteredExpenseTypes = expenseTypes.filter(
    (expenseType) => expenseType.expense_type_id !== miscellaneous_type_id,
  );

  return (
    <HookFormPersistProvider>
      <PureFinanceTypeSelection
        title={t('EXPENSE.ADD_EXPENSE.TITLE')}
        leadText={t('EXPENSE.ADD_EXPENSE.WHICH_TYPES_TO_RECORD')}
        cancelTitle={t('EXPENSE.ADD_EXPENSE.FLOW')}
        types={filteredExpenseTypes}
        onContinue={nextPage}
        onGoBack={history.back}
        progressValue={33}
        onGoToManageCustomType={() => history.push('/manage_custom_expenses')}
        isTypeSelected={!!selectedTypes.length}
        formatListItemData={(data) => {
          const {
            farm_id,
            expense_translation_key,
            expense_type_id,
            expense_name,
            custom_description,
          } = data;

          return {
            key: expense_type_id,
            icon: icons[farm_id ? 'OTHER' : expense_translation_key],
            label: farm_id ? expense_name : t(`expense:${expense_translation_key}.EXPENSE_NAME`),
            onClick: () => addRemoveType(expense_type_id),
            selected: selectedTypes.includes(expense_type_id),
            className: labelIconStyles.boldLabelIcon,
            description: farm_id
              ? custom_description
              : t(`expense:${expense_translation_key}.CUSTOM_DESCRIPTION`),
          };
        }}
        listItemType={listItemTypes.ICON_DESCRIPTION_CHECKBOX}
        useHookFormPersist={useHookFormPersist}
        iconLinkId={'manageCustomExpenseType'}
        Wrapper={ManageCustomExpenseTypesSpotlight}
        customTypeMessages={{
          info: t('FINANCES.CANT_FIND.INFO_EXPENSE'),
          manage: t('FINANCES.CANT_FIND.MANAGE_EXPENSE'),
        }}
        miscellaneousConfig={{
          addRemove: () => this.addRemoveType(miscellaneous_type_id),
          selected: selectedTypes.includes(miscellaneous_type_id),
        }}
        getSearchableString={getFinanceTypeSearchableStringFunc('expense')}
        searchPlaceholderText={t('FINANCES.SEARCH.EXPENSE_TYPES')}
      />
    </HookFormPersistProvider>
  );
};

export default ExpenseCategories;
