import React, { Component } from 'react';
import DateContainer from '../../../components/Inputs/DateContainer';
import moment from 'moment';
import PageTitle from '../../../components/PageTitle';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../styles.scss';
import { actions } from 'react-redux-form';
import SaleForm from '../../../components/Forms/Sale';
import { addOrUpdateSale } from '../actions';
import { convertToMetric, getUnit, grabCurrencySymbol } from '../../../util';
import history from '../../../history';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { currentFieldCropsSelector } from '../../fieldCropSlice';
import { getFieldCrops } from '../../saga';

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
    this.props.dispatch(getFieldCrops());
    //TODO fetch farm
  }

  handleSubmit(sale) {
    const { dispatch } = this.props;
    const cropSale = this.state.chosenOptions.map((c) => {
      return {
        sale_value: sale ? sale[c.label].value && parseFloat(sale[c.label].value).toFixed(2) : 0,
        quantity_kg: sale
          ? sale[c.label].quantity_kg &&
            parseFloat(
              convertToMetric(
                parseFloat(sale[c.label].quantity_kg),
                this.state.quantity_unit,
                'kg',
              ),
            )
          : 0,
        crop_id: c.value,
      };
    });
    const newSale = {
      customer_name: sale.name,
      sale_date: this.state.date,
      farm_id: this.props.farm.farm_id,
      cropSale,
    };
    dispatch(addOrUpdateSale(newSale));
    history.push('/finances');
  }

  handleChooseCrop(option) {
    this.setState({
      chosenOptions: option,
    });
  }

  getCropOptions = (fieldCrops) => {
    if (!fieldCrops || fieldCrops.length === 0) {
      return;
    }

    let cropOptions = [];
    let cropSet = new Set();

    for (let fc of fieldCrops) {
      if (!cropSet.has(fc.crop_id)) {
        cropOptions.push({
          label: this.props.t(`crop:${fc.crop_translation_key}`),
          value: fc.crop_id,
        });
        cropSet.add(fc.crop_id);
      }
    }

    return cropOptions;
  };

  render() {
    let fieldCrops = this.props.fieldCrops || [];
    const cropOptions = this.getCropOptions(fieldCrops);
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl="/Finances" title={this.props.t('SALE.ADD_SALE.TITLE')} />
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
          cropOptions={cropOptions}
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
    fieldCrops: currentFieldCropsSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AddSale));
