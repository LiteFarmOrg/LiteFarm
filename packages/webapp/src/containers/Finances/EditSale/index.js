import React, { Component } from 'react';
import PageTitle from '../../../components/PageTitle';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../styles.scss';
import { actions } from 'react-redux-form';
import SaleForm from '../../../components/Forms/Sale';
import { selectedSaleSelector } from '../selectors';
import { cropSelector as fieldCropSelector } from '../../selector';
import { getFieldCrops } from '../../actions';
import DateContainer from '../../../components/Inputs/DateContainer';
import moment from 'moment';
import { deleteSale, updateSale } from '../actions';
import { convertFromMetric, convertToMetric, getUnit, grabCurrencySymbol, roundToTwoDecimal } from '../../../util';
import ConfirmModal from '../../../components/Modals/Confirm';
import history from '../../../history';
import { userFarmSelector } from '../../userFarmSlice';
import {withTranslation} from "react-i18next";

class EditSale extends Component {
  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('financeReducer.forms.editSale'));
    const sale = this.props.sale || {};
    const chosenOptions = sale && sale.cropSale.map((cs) => {
      const crop = cs.crop.crop_common_name;
      return { label: crop, value: cs.crop.crop_id, sale_id: cs.sale_id }
    });
    this.state = {
      date: moment.utc(sale && sale.date),
      quantity_unit: getUnit(this.props.farm, 'kg', 'lb'),
      chosenOptions,
      currencySymbol: grabCurrencySymbol(this.props.farm),
    };
    sale && sale.cropSale.forEach((cs) => {
      const crop = cs.crop.crop_common_name;
      this.props.dispatch(actions.change(`financeReducer.forms.editSale.${crop}.quantity_kg`, cs.quantity_kg.toString()));
      this.props.dispatch(actions.change(`financeReducer.forms.editSale.${crop}.value`, cs.sale_value.toString()));
      this.props.dispatch(actions.change(`financeReducer.forms.editSale.${crop}.quantity_kg`, roundToTwoDecimal(convertFromMetric(cs.quantity_kg.toString(), this.state.quantity_unit, 'kg').toString())));
    });
    this.props.dispatch(actions.change('financeReducer.forms.editSale.name', sale.customerName));
    this.props.dispatch(actions.change('financeReducer.forms.editSale.fieldCrop', chosenOptions));
    this.handleChooseCrop = this.handleChooseCrop.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(getFieldCrops());
  }

  handleChooseCrop(option) {
    this.setState({
      chosenOptions: option
    })
  }

  handleSubmit(form) {
    const { dispatch, sale } = this.props;

    const cropSale = this.state.chosenOptions.map((c) => {
      return {
        sale_value: form && form[c.label] && form[c.label].value.length ? parseFloat(form[c.label].value).toFixed(2) : 0,
        quantity_kg: form && form[c.label] && form[c.label].quantity_kg.length ? convertToMetric(parseFloat(form[c.label].quantity_kg), this.state.quantity_unit, 'kg') : 0,
        crop_id: c.value,
        sale_id: sale.id,
      }
    });

    const editedSale = {
      sale_id: sale.id,
      customer_name: form.name,
      sale_date: this.state.date,
      farm_id: this.props.farm.farm_id,
      cropSale
    };
    dispatch(updateSale(editedSale));
    history.push('/finances');
  }

  getCropOptions = (fieldCrops) =>{
    if(!fieldCrops || fieldCrops.length === 0) {
      return;
    }

    let cropOptions = [];
    let cropSet = new Set();

    for(let fc of fieldCrops){
      if(!cropSet.has(fc.crop_id)){
        cropOptions.push({ label: fc.crop_common_name, value: fc.crop_id});
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
        <PageTitle backUrl='/sales_summary' title={this.props.t('SALE.EDIT_SALE.TITLE')}/>
        <span className={defaultStyles.dateContainer}>
          <label>{this.props.t('SALE.EDIT_SALE.DATE')}</label>
          <DateContainer
            style={defaultStyles.date}
            custom={true}
            date={this.state.date}
            onDateChange={(date) => this.setState({ date })}
          />
        </span>
        <SaleForm
          model="financeReducer.forms.editSale"
          cropOptions={cropOptions}
          chosenOptions={this.state.chosenOptions}
          handleChooseCrop={this.handleChooseCrop}
          onSubmit={this.handleSubmit}
          quantityUnit={this.state.quantity_unit}
          footerOnClick={() => this.setState({ showModal: true })}
          footerText={this.props.t('common:DELETE')}
          currencySymbol={this.state.currencySymbol}
        />
        <ConfirmModal
          open={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
          onConfirm={() => {this.props.dispatch(deleteSale(this.props.sale));history.push('/finances');}}
          message={this.props.t('SALE.EDIT_SALE.DELETE_CONFIRMATION')}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    sale: selectedSaleSelector(state),
    fieldCrops: fieldCropSelector(state),
    farm: userFarmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EditSale));
