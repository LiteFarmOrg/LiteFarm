import React, { Component } from 'react';
import { connect } from 'react-redux';
import insightStyles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { pricesDistanceSelector, pricesSelector } from '../selectors';
import PriceCropContainer from '../../../components/Insights/PriceCropContainer';
import { farmSelector } from '../../selector';
import { grabCurrencySymbol } from '../../../util';
import { Collapse } from 'react-bootstrap';
import { setPricesDistance, getPricesWithDistanceData } from '../actions';
import PriceDistanceComponent from '../../../components/Insights/PriceDistanceComponent';
import { Button } from 'react-bootstrap';
import styles from './styles.scss';

const MILE_TO_KILOMETER = 1.609;


class Prices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currencySymbol: grabCurrencySymbol(this.props.farm),
      open: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleOpenCollapse = this.handleOpenCollapse.bind(this);


    this.infoBoxBody =
      <div>We show you the trajectory of your sales prices against the sales prices for the same goods within a given
        distance of you, collected across the LiteFarm network.</div>
  }

  handleChange(distance) {
    this.props.dispatch(setPricesDistance(distance));
  }

  handleOpenCollapse() {
    this.setState({ open: !this.state.open })
  }

  componentDidMount() {
    if (this.props.pricesDistance && this.props.farm.grid_points) {
      this.props.dispatch(getPricesWithDistanceData(this.props.farm.grid_points, this.props.pricesDistance))
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pricesDistance !== this.props.pricesDistance && this.props.farm.grid_points) {
      this.props.dispatch(getPricesWithDistanceData(this.props.farm.grid_points, this.props.pricesDistance))
    }
    // TODO need rewrite
    if (this.props.farm?.units?.measurement === 'imperial' && Number.isInteger(this.props.pricesDistance)) {
      this.handleChange(5 * MILE_TO_KILOMETER);
    } else if (this.props.farm?.units?.measurement === 'metric' && !Number.isInteger(this.props.pricesDistance)) {
      this.handleChange(5);
    }
  }


  render() {
    const isImperial = this.props.farm && this.props.farm.units?.measurement === 'imperial';
    const distances = isImperial ? [5, 10, 20, 35] : [5, 10, 25, 50]
    const distanceToDisplay = isImperial ? this.props.pricesDistance / MILE_TO_KILOMETER : this.props.pricesDistance;
    const unit = isImperial ? 'mi' : 'km';
    const { currencySymbol } = this.state;
    const { pricesData } = this.props;
    const { data: cropsWithPriceInfo } = pricesData;
    return (
      <div className={insightStyles.insightContainer}>
        <PageTitle title="Prices" backUrl="/Insights/"
                   rightIcon={true} rightIconBody={this.infoBoxBody} rightIconTitle={'Prices'}/>
        {this.props.pricesDistance &&
        <div>
          <div style={{ float: 'left' }}><b>Sales from {distanceToDisplay} {unit} away</b></div>
          <div style={{ float: 'right' }}><PriceDistanceComponent handleOpenCollapse={this.handleOpenCollapse}/></div>
          <hr/>
          <div style={{ float: 'left' }}>
            <Collapse in={this.state.open}>
              <div>
                <div>
                  Pulling from {this.props.pricesData['amountOfFarms']} farms for sales data
                </div>
                {distances.map((distance, index) => {
                  if (distanceToDisplay === distance) {
                    return <Button className={styles.distanceButton}
                                   key={'active-button-' + index}>{distance} {unit}</Button>
                  } else {
                    return <Button onClick={() => {
                      this.handleChange(isImperial ? distance * MILE_TO_KILOMETER : distance)
                    }} className={'active ' + styles.distanceButton} key={'button-' + index}>{distance} {unit}</Button>
                  }
                })}
                <hr/>
              </div>
            </Collapse>
          </div>
        </div>}
        {!this.props.farm.grid_points && <div>
          You currently do not have an address in LiteFarm. Please update it in your Profile to get nearby prices
          information!
        </div>}
        {
          cropsWithPriceInfo.map((cropInfo, index) => {
            const cropName = Object.keys(cropInfo)[0];
            const pricePoints = cropInfo[cropName]; // each month is a price point
            return (
              <div key={index + '-' + cropName}>
                <PriceCropContainer
                  currencySymbol={currencySymbol}
                  name={cropName}
                  pricePoints={pricePoints}
                />
              </div>
            )
          })
        }
      </div>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    pricesData: pricesSelector(state),
    pricesDistance: pricesDistanceSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Prices)
