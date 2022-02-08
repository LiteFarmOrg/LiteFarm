import React, { Component } from 'react';
import { connect } from 'react-redux';
import insightStyles from '../styles.module.scss';
import PageTitle from '../../../components/PageTitle';
import { pricesDistanceSelector, pricesSelector } from '../selectors';
import PriceCropContainer from '../../../components/Insights/PriceCropContainer';
import { getPricesWithDistanceData, setPricesDistance } from '../actions';
import PriceDistanceComponent from '../../../components/Insights/PriceDistanceComponent';
import styles from './styles.module.scss';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { Text } from '../../../components/Typography';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';

const MILE_TO_KILOMETER = 1.609;

class Prices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currencySymbol: grabCurrencySymbol(),
      open: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleOpenCollapse = this.handleOpenCollapse.bind(this);
  }

  handleChange(distance) {
    this.props.dispatch(setPricesDistance(distance));
  }

  handleOpenCollapse() {
    this.setState({ open: !this.state.open });
  }

  componentDidMount() {
    if (this.props.pricesDistance && this.props.farm.grid_points) {
      this.props.dispatch(
        getPricesWithDistanceData(this.props.farm.grid_points, this.props.pricesDistance),
      );
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pricesDistance !== this.props.pricesDistance && this.props.farm.grid_points) {
      this.props.dispatch(
        getPricesWithDistanceData(this.props.farm.grid_points, this.props.pricesDistance),
      );
    }
    // TODO need rewrite
    if (
      this.props.farm?.units?.measurement === 'imperial' &&
      Number.isInteger(this.props.pricesDistance)
    ) {
      this.handleChange(5 * MILE_TO_KILOMETER);
    } else if (
      this.props.farm?.units?.measurement === 'metric' &&
      !Number.isInteger(this.props.pricesDistance)
    ) {
      this.handleChange(5);
    }
  }

  render() {
    const isImperial = this.props.farm && this.props.farm.units?.measurement === 'imperial';
    const distances = isImperial ? [5, 10, 20, 35] : [5, 10, 25, 50];
    const distanceToDisplay = isImperial
      ? this.props.pricesDistance / MILE_TO_KILOMETER
      : this.props.pricesDistance;
    const unit = isImperial ? 'mi' : 'km';
    const { currencySymbol } = this.state;
    const { pricesData } = this.props;
    const { data: cropsWithPriceInfo } = pricesData;
    const { t } = this.props;
    return (
      <div className={insightStyles.insightContainer}>
        <PageTitle
          title={t('INSIGHTS.PRICES.TITLE')}
          backUrl="/Insights"
          rightIcon={true}
          rightIconTitle={t('INSIGHTS.PRICES.TITLE')}
          rightIconBody={<div>{t('INSIGHTS.PRICES.INFO')}</div>}
        />
        {this.props.pricesDistance && (
          <div style={{ marginBottom: '8px' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}
            >
              <Text>
                {t('INSIGHTS.PRICES.NEARBY_FARMS', {
                  count: this.props.pricesData['amountOfFarms'],
                })}
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: 'bold' }}>
                {t('INSIGHTS.PRICES.SALES_FROM_DISTANCE_AWAY', {
                  distance: distanceToDisplay,
                  unit,
                })}
              </Text>
              <PriceDistanceComponent handleOpenCollapse={this.handleOpenCollapse} />
            </div>
            <div>
              {this.state.open && (
                <div>
                  {distances.map((distance, index) => {
                    if (distanceToDisplay === distance) {
                      return (
                        <button className={styles.distanceButton} key={'active-button-' + index}>
                          {distance} {unit}
                        </button>
                      );
                    } else {
                      return (
                        <button
                          onClick={() => {
                            this.handleChange(isImperial ? distance * MILE_TO_KILOMETER : distance);
                          }}
                          className={'active ' + styles.distanceButton}
                          key={'button-' + index}
                        >
                          {distance} {unit}
                        </button>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        {!this.props.farm.grid_points && <div>{t('INSIGHTS.PRICES.NO_ADDRESS')}</div>}
        {cropsWithPriceInfo.map((cropInfo, index) => {
          const cropName = Object.keys(cropInfo)[0];
          const pricePoints = cropInfo[cropName]; // each month is a price point
          return (
            <div key={index + '-' + cropName}>
              <PriceCropContainer
                currencySymbol={currencySymbol}
                name={t(`crop:${cropName}`)}
                pricePoints={pricePoints}
              />
            </div>
          );
        })}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    pricesData: pricesSelector(state),
    pricesDistance: pricesDistanceSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Prices));
