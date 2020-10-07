import React, {Component} from "react";
import {connect} from 'react-redux';
import styles from './styles.scss';
import PageTitle from '../../../components/PageTitle';
import moment from 'moment';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import history from '../../../history';
import {fieldSelector, cropSelector, farmSelector} from '../../selector';
import {deleteSale} from "../actions";
import ConfirmModal from "../../../components/Modals/Confirm";
import {selectedSaleSelector} from '../selectors';
import {convertFromMetric, getUnit, grabCurrencySymbol, roundToTwoDecimal} from "../../../util";

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
    })
  };


  render() {
    let {sale} = this.props;

    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let date;

    if(sale){
      let logDate = moment(sale.date);
      date = months[logDate.month()] + ' ' + logDate.date().toString() + ', ' + logDate.year().toString();
    }


    let dropDown = 0;
    if (sale) return (
      <div className={styles.logContainer}>
        <PageTitle backUrl="/sales_summary" title="Sale Detail"/>
        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <div>
              <strong> {date}</strong>
            </div>
            <DropdownButton
              data-test='edit-or-delete-sale'
              style={{background: '#EFEFEF', color: '#4D4D4D', border: 'none'}}
              title={'Edit'}
              key={dropDown}
              id={`dropdown-basic-${dropDown}`}
            >
              {/*<MenuItem data-test='edit-sale' eventKey="0" onClick={() => history.push('/edit_sale')}>Edit</MenuItem>*/}
              <MenuItem data-test='delete-sale' eventKey="1" onClick={() => this.confirmDelete()}>Delete</MenuItem>
            </DropdownButton>
          </div>
        </div>

        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <div>Customer Name</div>
            <span>{sale.customerName}</span>
          </div>
        </div>

        <div className={styles.infoBlock}>
          <div key={sale.sale_id} className={styles.cropSaleHeader}>
            <div className={styles.headerChildName}>Crop</div>
            <div className={styles.headerChildVal}>Quantity({this.state.quantity_unit})</div>
            <div className={styles.headerChildVal}>Value({this.state.currencySymbol})</div>
          </div>
        </div>

        {
          sale.cropSale && sale.cropSale.map((cs) => {
            return <div key={sale.sale_id} className={styles.cropSaleRow}>
              <div className={styles.cropName}>{cs.crop.crop_common_name}</div>
              <div className={styles.cropQuantVal}>{roundToTwoDecimal(convertFromMetric(cs.quantity_kg.toString(), this.state.quantity_unit, 'kg').toString())}</div>
              <div className={styles.cropQuantVal}>{cs.sale_value}</div>
            </div>
          })
        }


        <ConfirmModal
          open={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
          onConfirm={() => {this.props.dispatch(deleteSale(this.props.sale)); history.push('/finances');}}
          message='Are you sure you want to delete this sale?'
        />
      </div>
    )
  }

}


const mapStateToProps = (state) => {
  return {
    fields: fieldSelector(state),
    crops: cropSelector(state),
    sale: selectedSaleSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SaleDetail);
