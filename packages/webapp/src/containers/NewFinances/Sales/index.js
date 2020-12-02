import styles from '../../Finances/styles.scss';
import React, {Component} from "react";
import {Button} from "react-bootstrap";
import history from "../../../history";
import PageTitle from "../../../components/PageTitle";
import Table from '../../../components/Table';
import { salesSelector } from '../../Finances/selectors';
import {getSales} from '../../Finances/actions';
import {connect} from 'react-redux';
import {setSelectedSale} from "../../Finances/actions";
import moment from 'moment';
import {withTranslation} from "react-i18next";

class SalesSummary extends Component {
  constructor(props) {
    super(props);
    this.formatCropSales = this.formatCropSales.bind(this);
    this.formatSales = this.formatSales.bind(this);
    this.formatFooter = this.formatFooter.bind(this);
    this.filterByDate = this.filterByDate.bind(this);
    this.state = {
      startDate: moment().startOf('year'),
      endDate: moment().endOf('year'),
    }
  }

  componentDidMount() {
    // dispatch getSales and getCropSales
    this.props.dispatch(getSales());
  }

  // format cropSales data to insert into summary table
  formatCropSales(sales) {
    let cropMap = {};
    if (sales.length) {
      sales.map((s) => {
        return s.cropSale.forEach((cs) => {
          if (cropMap[cs.fieldCrop.crop.crop_common_name]) {
            cropMap[cs.fieldCrop.crop.crop_common_name] += cs.sale_value;
          } else {
            cropMap[cs.fieldCrop.crop.crop_common_name] = cs.sale_value || 0;
          }
        })
      })
    }
    return Object.keys(cropMap).map((k) => {
      return { crop: k, value: cropMap[k]}
    });
  }

  formatFooter(data) {
    let summaryTotal = 0;
    data.forEach((s) => {
      summaryTotal += s.value;
    });
    return summaryTotal;
  }

  // format sales data to insert into summary table
  formatSales(sales) {
    return sales.map((s) => {
      let crop;
      let value = 0;
      const date = s.sale_date;
      if (s.cropSale.length > 1) {
        crop = 'multiple';
        s.cropSale.forEach((cs) => {
          value += cs.sale_value;
        })
      } else {
        crop = s.cropSale[0].fieldCrop.crop.crop_common_name;
        value = s.cropSale[0].sale_value;
      }
      return { date, crop, value, cropSale: s.cropSale, customerName: s.customer_name, id: s.sale_id }
    })
  }

  filterByDate(sales) {
    return sales.filter((s) => {
      const fullDate = new Date(s.sale_date);
      return ((this.state.startDate && this.state.startDate._d) <= fullDate && (this.state.endDate && this.state.endDate._d) >= fullDate);
    })
  }

  render() {
    const sales = this.props.sales || [];
    const summaryData = this.formatCropSales(this.filterByDate(sales));
    const detailedHistoryData = this.formatSales(this.filterByDate(sales));

    // columns config for Summary Table
    const summaryColumns = [{
      id: 'crop',
      Header: 'Crop',
      accessor: (e) => e.crop,
      minWidth: 70,
      Footer: <div>Total</div>
    }, {
      id: 'value',
      Header: 'Value',
      accessor: (e) => `$${e.value}`,
      minWidth: 75,
      Footer: <div>${this.formatFooter(summaryData)}</div>
    }];

    const detailedHistoryColumns = [{
      id: 'date',
      Header: 'Date',
      accessor: (e) => e.date,
      minWidth: 70
    }, {
      id: 'crop',
      Header: 'Crop',
      accessor: (e) => e.crop,
      minWidth: 75,
      Footer: <div>Total</div>
    }, {
      id: 'value',
      Header: 'Value',
      accessor: (e) => `$${e.value}`,
      minWidth: 75,
      Footer: <div>${this.formatFooter(detailedHistoryData)}</div>
    }];

    return (
      <div className={styles.financesContainer}>
        <PageTitle backUrl='/newfinances' title='Sales'/>
        <div className={styles.buttonContainer}>
          <Button onClick={()=>{history.push('sales/add_sale')}}>{this.props.t('SALE.ADD_SALE.NEW')}</Button>
        </div>
        <div className={styles.topContainer}>
          <h4><strong>{this.props.t('NEW_FINANCES.SALE.SUMMARY')}</strong></h4>
        </div>

        <Table
          columns={summaryColumns}
          data={summaryData}
          showPagination={false}
          minRows={5}
          className="-striped -highlight"
        />
        <hr />
        <div className={styles.topContainer}>
          <h4><strong>{this.props.t('NEW_FINANCES.SALE.DETAILED_HISTORY')}</strong></h4>
        </div>
        <Table
          columns={detailedHistoryColumns}
          data={detailedHistoryData}
          showPagination={false}
          minRows={5}
          className="-striped -highlight"
          getTdProps={(state, rowInfo, column, instance) => {
            return {
              onClick: (e, handleOriginal) => {
                rowInfo && this.props.dispatch(setSelectedSale(rowInfo.original));
                history.push(`sales/edit_sale`);

                // IMPORTANT! React-Table uses onClick internally to trigger
                // events like expanding SubComponents and pivots.
                // By default a custom 'onClick' handler will override this functionality.
                // If you want to fire the original onClick handler, call the
                // 'handleOriginal' function.
                if (handleOriginal) {
                  handleOriginal();
                }
              }
            };
          }}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    sales: salesSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SalesSummary));
