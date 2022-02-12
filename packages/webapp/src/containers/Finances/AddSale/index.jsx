import React, { Component } from 'react';
import DateContainer from '../../../components/Inputs/DateContainer';
import moment from 'moment';
import PageTitle from '../../../components/PageTitle/v2';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../styles.module.scss';
import { actions } from 'react-redux-form';
import SaleForm from '../../../components/Forms/Sale';
import { addOrUpdateSale } from '../actions';
import { convertToMetric, getUnit } from '../../../util';
import history from '../../../history';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { currentAndPlannedManagementPlansSelector } from '../../managementPlanSlice';
import { getManagementPlans } from '../../saga';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';

class AddSale extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      chosenOptions: [],
      quantity_unit: getUnit(this.props.farm, 'kg', 'lb'),
      currencySymbol: grabCurrencySymbol(this.props.farm),
    };
    this.props.dispatch(actions.reset('financeReducer.forms.addSale'));
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChooseCrop = this.handleChooseCrop.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(getManagementPlans());
    //TODO fetch farm
  }

  handleSubmit(sale) {
    const { dispatch } = this.props;
    const crop_variety_sale = this.state.chosenOptions.map((c) => {
      return {
        sale_value: sale ? sale[c.label].value && parseFloat(sale[c.label].value).toFixed(2) : 0,
        quantity: sale
          ? sale[c.label].quantity &&
            parseFloat(
              convertToMetric(parseFloat(sale[c.label].quantity), this.state.quantity_unit, 'kg'),
            )
          : 0,
        quantity_unit: this.state.quantity_unit,
        crop_variety_id: c.value,
      };
    });
    const newSale = {
      customer_name: sale.name,
      sale_date: this.state.date,
      farm_id: this.props.farm.farm_id,
      crop_variety_sale,
    };
    dispatch(addOrUpdateSale(newSale));
  }

  handleChooseCrop(option) {
    this.setState({
      chosenOptions: option,
    });
  }

  getCropVarietyOptions = (managementPlans) => {
    if (!managementPlans || managementPlans.length === 0) {
      return;
    }

    let cropVarietyOptions = [];
    let cropVarietySet = new Set();

    for (let mp of managementPlans) {
      if (!cropVarietySet.has(mp.crop_variety_id)) {
        cropVarietyOptions.push({
          label: mp.crop_variety_name
            ? `${mp.crop_variety_name}, ${this.props.t(`crop:${mp.crop_translation_key}`)}`
            : this.props.t(`crop:${mp.crop_translation_key}`),
          value: mp.crop_variety_id,
        });
        cropVarietySet.add(mp.crop_variety_id);
      }
    }

    cropVarietyOptions.sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

    return cropVarietyOptions;
  };

  render() {
    let managementPlans = this.props.managementPlans || [];
    const cropVarietyOptions = this.getCropVarietyOptions(managementPlans);
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle title={this.props.t('SALE.ADD_SALE.TITLE')} onGoBack={() => history.back()} />
        <span className={defaultStyles.dateContainer}>
          <label>{this.props.t('SALE.ADD_SALE.DATE')}</label>
          <DateContainer
            style={defaultStyles.date}
            custom={true}
            date={this.state.date}
            onDateChange={(date) => this.setState({ date })}
          />
        </span>
        <SaleForm
          model="financeReducer.forms.addSale"
          cropVarietyOptions={cropVarietyOptions}
          onSubmit={this.handleSubmit}
          chosenOptions={this.state.chosenOptions}
          handleChooseCrop={this.handleChooseCrop}
          quantityUnit={this.state.quantity_unit}
          footerText={this.props.t('common:CANCEL')}
          footerOnClick={() => history.push('/finances')}
          currencySymbol={this.state.currencySymbol}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    managementPlans: currentAndPlannedManagementPlansSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AddSale));
