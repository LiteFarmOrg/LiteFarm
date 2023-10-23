import React, { Component } from 'react';
import connect from 'react-redux/es/connect/connect';
import { expenseTypeTileContentsSelector, selectedExpenseSelector } from '../../selectors';
import { ReactComponent as EquipIcon } from '../../../../assets/images/finance/Equipment-icn.svg';
import { ReactComponent as SoilAmendmentIcon } from '../../../../assets/images/finance/Soil-amendment-icn.svg';
import { ReactComponent as PestIcon } from '../../../../assets/images/finance/Pest-icn.svg';
import { ReactComponent as FuelIcon } from '../../../../assets/images/finance/Fuel-icn.svg';
import { ReactComponent as MachineIcon } from '../../../../assets/images/finance/Machinery-icn.svg';
import { ReactComponent as SeedIcon } from '../../../../assets/images/finance/Seeds-icn.svg';
import { ReactComponent as OtherIcon } from '../../../../assets/images/finance/Custom-expense.svg';
import { ReactComponent as LandIcon } from '../../../../assets/images/finance/Land-icn.svg';
import { ReactComponent as MiscellaneousIcon } from '../../../../assets/images/finance/Miscellaneous-icn.svg';
import { ReactComponent as UtilitiesIcon } from '../../../../assets/images/finance/Utilities-icn.svg';
import { ReactComponent as LabourIcon } from '../../../../assets/images/finance/Labour-icn.svg';
import { ReactComponent as InfrastructureIcon } from '../../../../assets/images/finance/Infrastructure-icn.svg';
import { ReactComponent as TransportationIcon } from '../../../../assets/images/finance/Transportation-icn.svg';
import { ReactComponent as ServicesIcon } from '../../../../assets/images/finance/Services-icn.svg';
import { setSelectedExpenseTypes } from '../../actions';
import history from '../../../../history';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import ManageCustomExpenseTypesSpotlight from '../ManageCustomExpenseTypesSpotlight';
import PureFinanceTypeSelection from '../../../../components/Finances/PureFinanceTypeSelection';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import labelIconStyles from '../../../../components/Tile/styles.module.scss';

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

class ExpenseCategories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // filter out previously selected and retired types
      selectedTypes: this.props.selectedExpense.filter((typeId) => {
        return this.props.expenseTypes.some(({ expense_type_id }) => expense_type_id === typeId);
      }),
    };

    this.addRemoveType = this.addRemoveType.bind(this);
    this.nextPage = this.nextPage.bind(this);
  }

  nextPage(event) {
    event.preventDefault();
    this.props.dispatch(setSelectedExpenseTypes(this.state.selectedTypes));
    history.push('/add_expense');
  }

  addRemoveType(id) {
    let { selectedTypes } = this.state;
    if (selectedTypes.includes(id)) {
      const index = selectedTypes.indexOf(id);
      selectedTypes.splice(index, 1);
    } else {
      selectedTypes.push(id);
    }
    this.setState({
      selectedTypes,
    });
  }

  render() {
    const { expenseTypes } = this.props;

    return (
      <HookFormPersistProvider>
        <PureFinanceTypeSelection
          title={this.props.t('EXPENSE.ADD_EXPENSE.TITLE')}
          leadText={this.props.t('EXPENSE.ADD_EXPENSE.WHICH_TYPES_TO_RECORD')}
          cancelTitle={this.props.t('EXPENSE.ADD_EXPENSE.FLOW')}
          types={expenseTypes}
          onContinue={this.nextPage}
          onGoBack={this.props.history.back}
          progressValue={33}
          onGoToManageCustomType={() => history.push('/manage_custom_expenses')}
          isTypeSelected={!!this.state.selectedTypes.length}
          formatTileData={(data) => {
            const { farm_id, expense_translation_key, expense_type_id, expense_name } = data;

            return {
              key: expense_type_id,
              tileKey: expense_type_id,
              icon: icons[farm_id ? 'OTHER' : expense_translation_key],
              label: farm_id ? expense_name : this.props.t(`expense:${expense_translation_key}`),
              onClick: () => this.addRemoveType(expense_type_id),
              selected: this.state.selectedTypes.includes(expense_type_id),
              className: labelIconStyles.boldLabelIcon,
            };
          }}
          useHookFormPersist={this.props.useHookFormPersist}
          iconLinkId={'manageCustomExpenseType'}
          Wrapper={ManageCustomExpenseTypesSpotlight}
        />
      </HookFormPersistProvider>
    );
  }
}

ExpenseCategories.propTypes = {
  expenseTypes: PropTypes.array,
};

const mapStateToProps = (state) => {
  return {
    expenseTypes: expenseTypeTileContentsSelector(state),
    selectedExpense: selectedExpenseSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ExpenseCategories));
