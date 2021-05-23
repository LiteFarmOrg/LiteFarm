import styles from '../styles.module.scss';
import React, { Component } from 'react';
import history from '../../../history';
import PageTitle from '../../../components/PageTitle';
import Table from '../../../components/Table';
import { dateRangeSelector, salesSelector } from '../selectors';
import { getSales, setSelectedSale } from '../actions';
import { connect } from 'react-redux';
import moment from 'moment';
import DateRangeSelector from '../../../components/Finances/DateRangeSelector';
import { BsCaretRight } from 'react-icons/all';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { Semibold } from '../../../components/Typography';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';

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
          const key = this.props.t(`crop:${cs.crop.crop_translation_key}`);
          if (cropMap[key]) {
            cropMap[key] += cs.sale_value;
          } else {
            cropMap[key] = cs.sale_value || 0;
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
      const date = moment(s.sale_date);
      if (s.cropSale.length > 1) {
        crop = 'multiple';
        s.cropSale.forEach((cs) => {
          value += cs.sale_value;
        });
      } else {
        crop = this.props.t(`crop:${s.cropSale[0].crop.crop_translation_key}`);
        value = s.cropSale[0].sale_value;
      }
      return {
        date,
        crop,
        value,
        cropSale: s.cropSale,
        customerName: s.customer_name,
        created_by_user_id: s.created_by_user_id,
        id: s.sale_id,
      };
    });
  }

  filterByDate(sales) {
    return sales.filter((s) => {
      return (
        moment(s.sale_date).isSameOrAfter(moment(this.state.startDate)) &&
        moment(s.sale_date).isSameOrBefore(moment(this.state.endDate))
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
        Header: this.props.t('SALE.SUMMARY.CROP'),
        accessor: (e) => e.crop,
        minWidth: 70,
        Footer: <div>{this.props.t('SALE.SUMMARY.TOTAL')}</div>,
      },
      {
        id: 'value',
        Header: this.props.t('SALE.SUMMARY.VALUE'),
        accessor: 'value',
        Cell: (d) => <span>{`${this.state.currencySymbol}${d.value.toFixed(2).toString()}`}</span>,
        minWidth: 75,
        Footer: <div>${this.formatFooter(summaryData)}</div>,
      },
    ];

    const detailedHistoryColumns = [
      {
        id: 'date',
        Header: this.props.t('SALE.SUMMARY.DATE'),
        Cell: (d) => <span>{moment(d.value).format('YYYY-MM-DD')}</span>,
        accessor: (d) => moment(d.date),
        minWidth: 70,
        Footer: <div>{this.props.t('SALE.SUMMARY.TOTAL')}</div>,
      },
      {
        id: 'crop',
        Header: this.props.t('SALE.SUMMARY.CROP'),
        accessor: (e) => e.crop,
        minWidth: 75,
      },
      {
        id: 'value',
        Header: this.props.t('SALE.SUMMARY.VALUE'),
        accessor: 'value',
        Cell: (d) => <span>{`${this.state.currencySymbol}${d.value.toFixed(2).toString()}`}</span>,
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
        <Semibold style={{ marginBottom: '16px' }}>{this.props.t('SALE.SUMMARY.SUMMARY')}</Semibold>

        <Table
          columns={summaryColumns}
          data={summaryData}
          showPagination={true}
          pageSizeOptions={[5, 10, 20, 50]}
          defaultPageSize={5}
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
        <Semibold style={{ marginBottom: '16px' }}>
          {this.props.t('SALE.SUMMARY.DETAILED_HISTORY')}
        </Semibold>
        <Table
          columns={detailedHistoryColumns}
          data={detailedHistoryData}
          showPagination={true}
          pageSizeOptions={[5, 10, 20, 50]}
          defaultPageSize={5}
          minRows={5}
          defaultSorted={[
            {
              id: 'date',
              desc: true,
            },
          ]}
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
