import styles from '../styles.scss';
import React, { Component } from 'react';
import history from '../../../history';
import PageTitle from '../../../components/PageTitle';
import Table from '../../../components/Table';
import { dateRangeSelector, salesSelector } from '../selectors';
import { getSales } from '../actions';
import { connect } from 'react-redux';
import { setSelectedSale } from '../actions';
import moment from 'moment';
import { grabCurrencySymbol } from '../../../util';
import DateRangeSelector from '../../../components/Finances/DateRangeSelector';
import { BsCaretRight } from 'react-icons/all';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';

class SalesSummary extends Component {
  constructor(props) {
    super(props);
    this.formatCropSales = this.formatCropSales.bind(this);
    this.formatSales = this.formatSales.bind(this);
    this.formatFooter = this.formatFooter.bind(this);
    this.filterByDate = this.filterByDate.bind(this);
    this.changeDate = this.changeDate.bind(this);
    let startDate, endDate;
    const { dateRange } = this.props;
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      startDate = moment(dateRange.startDate);
      endDate = moment(dateRange.endDate);
    } else {
      startDate = moment().startOf('year');
      endDate = moment().endOf('year');
    }

    this.state = {
      startDate,
      endDate,
      currencySymbol: grabCurrencySymbol(this.props.farm),
    };
  }

  componentDidMount() {
    // dispatch getSales and getCropSales
    this.props.dispatch(getSales());
  }

  changeDate(type, date) {
    if (type === 'start') {
      this.setState({ startDate: date });
    } else if (type === 'end') {
      this.setState({ endDate: date });
    } else {
      console.log('Error, type not specified');
    }
  }

  // format cropSales data to insert into summary table
  formatCropSales(sales) {
    let cropMap = {};
    if (sales.length) {
      sales.map((s) => {
        return s.cropSale.forEach((cs) => {
          if (cropMap[cs.crop.crop_common_name]) {
            cropMap[cs.crop.crop_common_name] += cs.sale_value;
          } else {
            cropMap[cs.crop.crop_common_name] = cs.sale_value || 0;
          }
        });
      });
    }
    return Object.keys(cropMap).map((k) => {
      return { crop: k, value: cropMap[k] };
    });
  }

  formatFooter(data) {
    let summaryTotal = 0;
    data.forEach((s) => {
      summaryTotal += s.value;
    });
    return summaryTotal.toFixed(2);
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
        });
      } else {
        crop = s.cropSale[0].crop.crop_common_name;
        value = s.cropSale[0].sale_value;
      }
      return {
        date,
        crop,
        value,
        cropSale: s.cropSale,
        customerName: s.customer_name,
        id: s.sale_id,
      };
    });
  }

  filterByDate(sales) {
    return sales.filter((s) => {
      const fullDate = new Date(s.sale_date);
      return (
        (this.state.startDate && this.state.startDate._d) <= fullDate &&
        (this.state.endDate && this.state.endDate._d) >= fullDate
      );
    });
  }

  render() {
    const sales = this.props.sales || [];
    const summaryData = this.formatCropSales(this.filterByDate(sales));
    const detailedHistoryData = this.formatSales(this.filterByDate(sales));

    // columns config for Summary Table
    const summaryColumns = [
      {
        id: 'crop',
        Header: 'Crop',
        accessor: (e) => e.crop,
        minWidth: 70,
        Footer: <div>Total</div>,
      },
      {
        id: 'value',
        Header: 'Value',
        accessor: (e) => `${this.state.currencySymbol}${e.value.toFixed(2)}`,
        minWidth: 75,
        Footer: <div>${this.formatFooter(summaryData)}</div>,
      },
    ];

    const detailedHistoryColumns = [
      {
        id: 'date',
        Header: 'Date',
        accessor: (e) => moment(e.date).format('YYYY-MM-DD'),
        minWidth: 70,
      },
      {
        id: 'crop',
        Header: 'Crop',
        accessor: (e) => e.crop,
        minWidth: 75,
        Footer: <div>{this.props.t('SALE.SUMMARY.TOTAL')}</div>,
      },
      {
        id: 'value',
        Header: 'Value',
        accessor: (e) => `${this.state.currencySymbol}${e.value.toFixed(2)}`,
        minWidth: 40,
        Footer: <div>${this.formatFooter(detailedHistoryData)}</div>,
      },
      {
        id: 'chevron',
        maxWidth: 25,
        accessor: () => <BsCaretRight />,
      },
    ];

    return (
      <div className={styles.financesContainer}>
        <PageTitle backUrl="/Finances" title={this.props.t('SALE.SUMMARY.TITLE')} />
        <DateRangeSelector changeDateMethod={this.changeDate} />
        <hr />
        <div className={styles.topContainer}>
          <h4>
            <strong>{this.props.t('SALE.SUMMARY.SUMMARY')}</strong>
          </h4>
        </div>

        <Table
          columns={summaryColumns}
          data={summaryData}
          showPagination={false}
          minRows={5}
          className="-striped -highlight"
          defaultSorted={[
            {
              id: 'date',
              desc: true,
            },
          ]}
        />
        <hr />
        <div className={styles.topContainer}>
          <h4>
            <strong>{this.props.t('SALE.SUMMARY.DETAILED_HISTORY')}</strong>
          </h4>
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
                history.push(`sale_detail`);

                // IMPORTANT! React-Table uses onClick internally to trigger
                // events like expanding SubComponents and pivots.
                // By default a custom 'onClick' handler will override this functionality.
                // If you want to fire the original onClick handler, call the
                // 'handleOriginal' function.
                if (handleOriginal) {
                  handleOriginal();
                }
              },
            };
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    sales: salesSelector(state),
    farm: userFarmSelector(state),
    dateRange: dateRangeSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SalesSummary));
