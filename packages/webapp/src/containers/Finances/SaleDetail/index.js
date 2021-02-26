import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import PageTitle from '../../../components/PageTitle';
import moment from 'moment';
import history from '../../../history';

import { deleteSale } from '../actions';
import ConfirmModal from '../../../components/Modals/Confirm';
import { selectedSaleSelector } from '../selectors';
import { convertFromMetric, getUnit, roundToTwoDecimal } from '../../../util';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { fieldsSelector } from '../../fieldSlice';
import { currentFieldCropsSelector } from '../../fieldCropSlice';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';
import DropdownButton from '../../../components/Form/DropDownButton';

class SaleDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      quantity_unit: getUnit(this.props.farm, 'kg', 'lb'),
      currencySymbol: grabCurrencySymbol(this.props.farm),
    };
  }

  confirmDelete = () => {
    this.setState({
      showModal: true,
    });
  };

  render() {
    let { sale, farm } = this.props;
    let date;

    if (sale) {
      date = moment(sale.date).locale(localStorage.getItem('litefarm_lang')).format('MMM-DD-YYYY');
    }

    let dropDown = 0;
    const options = [
      {
        text: this.props.t('common:EDIT'),
        onClick: () => history.push('/edit_sale'),
      },
      { text: this.props.t('common:DELETE'), onClick: () => this.confirmDelete() },
    ];

    if (sale)
      return (
        <div className={styles.logContainer}>
          <PageTitle backUrl="/sales_summary" title={this.props.t('SALE.DETAIL.TITLE')} />
          <div className={styles.infoBlock}>
            <div className={styles.innerInfo}>
              <div>
                <strong> {date}</strong>
              </div>
              {(Number(farm.role_id) === 1 ||
                Number(farm.role_id) === 2 ||
                Number(farm.role_id) === 5 ||
                farm.user_id === sale.created_by_user_id) && (
                <DropdownButton options={options}>
                  {this.props.t('SALE.DETAIL.ACTION')}
                </DropdownButton>
              )}
            </div>
          </div>

          <div className={styles.infoBlock}>
            <div className={styles.innerInfo}>
              <div>{this.props.t('SALE.DETAIL.CUSTOMER_NAME')}</div>
              <span>{sale.customerName}</span>
            </div>
          </div>

          <div className={styles.infoBlock}>
            <div key={sale.sale_id} className={styles.cropSaleHeader}>
              <div className={styles.headerChildName}>{this.props.t('SALE.DETAIL.CROP')}</div>
              <div className={styles.headerChildVal}>
                {this.props.t('SALE.DETAIL.QUANTITY')}({this.state.quantity_unit})
              </div>
              <div className={styles.headerChildVal}>
                {this.props.t('SALE.DETAIL.VALUE')}({this.state.currencySymbol})
              </div>
            </div>
          </div>

          {sale.cropSale &&
            sale.cropSale.map((cs) => {
              return (
                <div key={sale.sale_id} className={styles.cropSaleRow}>
                  <div className={styles.cropName}>
                    {this.props.t(`crop:${cs.crop.crop_translation_key}`)}
                  </div>
                  <div className={styles.cropQuantVal}>
                    {roundToTwoDecimal(
                      convertFromMetric(
                        cs.quantity_kg.toString(),
                        this.state.quantity_unit,
                        'kg',
                      ).toString(),
                    )}
                  </div>
                  <div className={styles.cropQuantVal}>{cs.sale_value}</div>
                </div>
              );
            })}

          <ConfirmModal
            open={this.state.showModal}
            onClose={() => this.setState({ showModal: false })}
            onConfirm={() => {
              this.props.dispatch(deleteSale(this.props.sale));
              history.push('/finances');
            }}
            message={this.props.t('SALE.DETAIL.DELETE_CONFIRMATION')}
          />
        </div>
      );
  }
}

const mapStateToProps = (state) => {
  return {
    fields: fieldsSelector(state),
    crops: currentFieldCropsSelector(state),
    sale: selectedSaleSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SaleDetail));
