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

class Prices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currencySymbol: grabCurrencySymbol(this.props.farm),
      distance: this.props.pricesDistance,
      open: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleOpenCollapse = this.handleOpenCollapse.bind(this);


    this.infoBoxBody =
      <div>We show you the trajectory of your sales prices against the sales prices for the same goods within a given
        distance of you, collected across the LiteFarm network.</div>
  }

  handleChange(distance) {
    this.setState({ distance: distance });
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
    if (prevProps.pricesDistance !== this.props.pricesDistance) {
      if(this.props.farm.grid_points){
        this.props.dispatch(getPricesWithDistanceData(this.props.farm.grid_points, this.props.pricesDistance));
        //TODO: need rewrite
      }
    }
    if(this.props.farm?.units?.measurement === 'imperial' && Number.isInteger(this.state.distance)){
      console.log('imperial', this.props.farm?.units?.measurement);
      this.handleChange(5*1.609);
    }else if(this.props.farm?.units?.measurement === 'metric' && !Number.isInteger(this.state.distance)){
      console.log('metric', this.props.farm?.units?.measurement);
      this.handleChange(5);
    }
  }

  render() {
    const isImperial = this.props.farm && this.props.farm.units?.measurement === 'imperial';
    const distances = isImperial ? [5, 10, 20, 35] : [5, 10, 25, 50]
    const { currencySymbol } = this.state;
    const { pricesData } = this.props;
    const { data: cropsWithPriceInfo } = pricesData;
    return (
      <div className={insightStyles.insightContainer}>
        <PageTitle title="Prices" backUrl="/Insights/"
                   rightIcon={true} rightIconBody={this.infoBoxBody} rightIconTitle={'Prices'}/>
        {this.state.distance &&
        <div>
          <div style={{ float: 'left' }}><b>Sales from {isImperial? this.state.distance/1.609 : this.state.distance} {isImperial? 'mi':'km'} away</b></div>
          <div style={{ float: 'right' }}><PriceDistanceComponent handleOpenCollapse={this.handleOpenCollapse}/></div>
          <hr/>
          <div style={{ float: 'left' }}>
            <Collapse in={this.state.open}>
              <div>
                <div>
                  Pulling from {this.props.pricesData['amountOfFarms']} farms for sales data
                </div>
                {distances.map((distance, index) => {
                  if (this.state.distance === distance) {
                    return <Button className={styles.distanceButton}
                                   key={'active-button-' + index}>{distance} {isImperial? 'mi':'km'}</Button>
                  } else {
                    return <Button onClick={() => {
                      this.handleChange(isImperial? distance*1.609:distance)
                    }} className={'active ' + styles.distanceButton} key={'button-' + index}>{distance} {isImperial? 'mi':'km'}</Button>
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
