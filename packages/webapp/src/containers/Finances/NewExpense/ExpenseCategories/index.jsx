import React, { Component } from 'react';
import PageTitle from '../../../../components/PageTitle';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../../styles.module.scss';
import styles from './styles.module.scss';
import { expenseTypeSelector } from '../../selectors';
import EquipImg from '../../../../assets/images/log/equipment.svg';
import SoilAmendmentImg from '../../../../assets/images/log/fertilizing.svg';
import PestImg from '../../../../assets/images/log/bug.svg';
import FuelImg from '../../../../assets/images/log/fuel.svg';
import MachineImg from '../../../../assets/images/log/machinery.svg';
import SeedImg from '../../../../assets/images/log/seeding.svg';
import OtherImg from '../../../../assets/images/log/other.svg';
import LandImg from '../../../../assets/images/log/land.svg';
import { setSelectedExpenseTypes } from '../../actions';
import history from '../../../../history';
import { withTranslation } from 'react-i18next';
import { Grid } from '@material-ui/core';

const iconMap = {
  EQUIPMENT: EquipImg,
  SOIL_AMENDMENT: SoilAmendmentImg,
  PESTICIDE: PestImg,
  FUEL: FuelImg,
  MACHINERY: MachineImg,
  SEEDS: SeedImg,
  OTHER: OtherImg,
  LAND: LandImg,
};

class ExpenseCategories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStyle: {
        width: '80px',
        height: '80px',
        borderRadius: '50px',
        background: '#00756A',
        margin: '0 auto',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
      },
      unSelectedStyle: {
        width: '80px',
        height: '80px',
        borderRadius: '50px',
        margin: '0 auto',
        background: '#82CF9C',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
      },
      selectedTypes: [],
    };

    this.addRemoveType = this.addRemoveType.bind(this);
    this.nextPage = this.nextPage.bind(this);
  }

  nextPage() {
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
    const { selectedStyle, unSelectedStyle, selectedTypes } = this.state;
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl="/Finances" title={this.props.t('EXPENSE.ADD_EXPENSE.TITLE_1')} />
        <Grid
          container
          spacing={3}
          style={{
            marginLeft: 0,
            marginRight: 0,
            marginTop: '24px',
            width: '100%',
          }}
        >
          {expenseTypes
            ?.sort((firstExpenseType, secondExpenseType) => {
              if (firstExpenseType.expense_translation_key === 'OTHER') return 1;
              if (secondExpenseType.expense_translation_key === 'OTHER') return -1;
              return this.props
                .t(`expense:${firstExpenseType.expense_translation_key}`)
                .localeCompare(
                  this.props.t(`expense:${secondExpenseType.expense_translation_key}`),
                );
            })
            .map((type) => {
              return (
                <Grid
                  item
                  xs={4}
                  md={3}
                  lg={2}
                  key={type.expense_type_id}
                  style={{ marginBottom: '12px' }}
                >
                  <div>
                    <div
                      style={
                        selectedTypes.includes(type.expense_type_id)
                          ? selectedStyle
                          : unSelectedStyle
                      }
                      onClick={() => this.addRemoveType(type.expense_type_id)}
                      className={styles.greenCircle}
                    >
                      <img
                        src={iconMap[type.expense_translation_key]}
                        alt=""
                        className={styles.circleImg}
                      />
                    </div>
                    <div className={styles.typeName}>
                      {this.props.t(`expense:${type.expense_translation_key}`)}
                    </div>
                  </div>
                </Grid>
              );
            })}
        </Grid>
        <div className={styles.bottomContainer}>
          <button className="btn btn-primary" onClick={() => this.nextPage()}>
            {this.props.t('common:NEXT')}
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    expenseTypes: expenseTypeSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ExpenseCategories));
