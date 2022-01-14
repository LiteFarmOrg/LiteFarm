import React, { Component } from 'react';
import PageTitle from '../../../components/PageTitle/v2';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../styles.module.scss';
import { actions } from 'react-redux-form';
import SaleForm from '../../../components/Forms/Sale';
import { selectedSaleSelector } from '../selectors';
import DateContainer from '../../../components/Inputs/DateContainer';
import moment from 'moment';
import { deleteSale, updateSale } from '../actions';
import { convertFromMetric, convertToMetric, getUnit, roundToTwoDecimal } from '../../../util';
import ConfirmModal from '../../../components/Modals/Confirm';
import history from '../../../history';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { currentAndPlannedManagementPlansSelector } from '../../managementPlanSlice';
import { getManagementPlans } from '../../saga';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';
import { cropVarietyEntitiesSelector } from '../../cropVarietySlice';
import { cropEntitiesSelector } from '../../cropSlice';

class EditSale extends Component {
  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('financeReducer.forms.editSale'));
    const sale = this.props.sale || {};
    const chosenOptions =
      sale &&
      sale.crop_variety_sale.map((cvs) => {
        const { crop_variety_name, crop_id } = this.props.cropVarietyEntities[cvs.crop_variety_id];
        const { crop_translation_key } = this.props.cropEntities[crop_id];
        return {
          label: crop_variety_name
            ? `${crop_variety_name}, ${this.props.t(`crop:${crop_translation_key}`)}`
            : this.props.t(`crop:${crop_translation_key}`),
          value: cvs.crop_variety_id,
        };
      });
    const quantity_unit =
      sale?.crop_variety_sale[0].quantity_unit || getUnit(this.props.farm, 'kg', 'lb');
    this.state = {
      date: moment.utc(sale && sale.sale_date),
      quantity_unit,
      chosenOptions,
      currencySymbol: grabCurrencySymbol(this.props.farm),
    };
    sale?.crop_variety_sale.forEach((cvs) => {
      const { crop_variety_name, crop_id } = this.props.cropVarietyEntities[cvs.crop_variety_id];
      const { crop_translation_key } = this.props.cropEntities[crop_id];
      const cropVariety = crop_variety_name
        ? `${crop_variety_name}, ${this.props.t(`crop:${crop_translation_key}`)}`
        : this.props.t(`crop:${crop_translation_key}`);
      this.props.dispatch(
        actions.change(
          `financeReducer.forms.editSale.${cropVariety}.value`,
          cvs.sale_value.toString(),
        ),
      );
      this.props.dispatch(
        actions.change(
          `financeReducer.forms.editSale.${cropVariety}.quantity`,
          roundToTwoDecimal(
            convertFromMetric(cvs.quantity.toString(), this.state.quantity_unit, 'kg').toString(),
          ),
        ),
      );
    });
    this.props.dispatch(actions.change('financeReducer.forms.editSale.name', sale.customer_name));
    this.props.dispatch(
      actions.change('financeReducer.forms.editSale.managementPlan', chosenOptions),
    );

    this.handleChooseCrop = this.handleChooseCrop.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(getManagementPlans());
  }

  handleChooseCrop(option) {
    this.setState({
      chosenOptions: option,
    });
  }

  handleSubmit(form) {
    const { dispatch, sale } = this.props;

    const crop_variety_sale = this.state.chosenOptions.map((c) => {
      return {
        sale_value: form?.[c.label]?.value ? Number(form[c.label].value).toFixed(2) : 0,
        quantity: form?.[c.label]?.quantity
          ? convertToMetric(Number(form[c.label].quantity), this.state.quantity_unit, 'kg')
          : 0,
        quantity_unit: this.state.quantity_unit,
        crop_variety_id: c.value,
      };
    });

    const editedSale = {
      sale_id: sale.sale_id,
      customer_name: form.name,
      sale_date: this.state.date,
      farm_id: this.props.farm.farm_id,
      crop_variety_sale,
    };
    dispatch(updateSale(editedSale));
    history.push('/finances');
  }

  getCropVarietyOptions = (managementPlans) => {
    if (!managementPlans || managementPlans.length === 0) {
      return;
    }

    let cropVarietyOptions = [];
    let cropVarietySet = new Set();

    for (let mp of managementPlans) {
      if (!cropVarietySet.has(mp.crop_variety_id)) {
        const { crop_variety_name, crop_id } = this.props.cropVarietyEntities[mp.crop_variety_id];
        const { crop_translation_key } = this.props.cropEntities[crop_id];
        cropVarietyOptions.push({
          label: crop_variety_name
            ? `${crop_variety_name}, ${this.props.t(`crop:${crop_translation_key}`)}`
            : this.props.t(`crop:${crop_translation_key}`),
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
        <PageTitle
          title={this.props.t('SALE.EDIT_SALE.TITLE')}
          style={{ marginBottom: '24px' }}
          onGoBack={() => history.goBack()}
        />
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
          cropVarietyOptions={cropVarietyOptions}
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
          onConfirm={() => {
            this.props.dispatch(deleteSale(this.props.sale));
          }}
          message={this.props.t('SALE.EDIT_SALE.DELETE_CONFIRMATION')}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    sale: selectedSaleSelector(state),
    managementPlans: currentAndPlannedManagementPlansSelector(state),
    farm: userFarmSelector(state),
    cropVarietyEntities: cropVarietyEntitiesSelector(state),
    cropEntities: cropEntitiesSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EditSale));
