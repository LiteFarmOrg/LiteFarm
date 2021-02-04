/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.scss';
import history from '../../history';
// images
import people_fed from '../../assets/images/insights/people_fed.svg';
import soil_om from '../../assets/images/insights/soil_om.svg';
import labour_happiness from '../../assets/images/insights/labour_happiness.svg';
import biodiversity from '../../assets/images/insights/biodiversity.svg';
import prices from '../../assets/images/insights/prices.svg';
import water_balance from '../../assets/images/insights/water_balance.svg';
// import erosion from '../../assets/images/insights/erosion.svg';
import nitrogen_balance from '../../assets/images/insights/nitrogen_balance.svg';
//
// actions
import {
  getCropsSoldNutrition,
  getLabourHappinessData,
  getSoilOMData,
  getBiodiversityData,
  getWaterBalanceData,
  getNitrogenBalanceData,
  getFrequencyNitrogenBalance,
  getPricesWithDistanceData,
  getWaterBalanceSchedule,
} from './actions';
// selectors
import {
  cropsNutritionSelector,
  labourHappinessSelector,
  soilOMSelector,
  biodiversitySelector,
  pricesSelector,
  waterBalanceSelector,
  nitrogenBalanceSelector,
  nitrogenFrequencySelector,
  pricesDistanceSelector,
  waterBalanceScheduleSelector,
} from './selectors';
import InfoBoxComponent from '../../components/InfoBoxComponent';
import { BsChevronRight } from 'react-icons/all';
import { userFarmSelector } from '../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { Title, Semibold, Text } from '../../components/Typography';
const MILLIMETER_TO_INCH = 0.0393701;
const KILOGRAM_TO_POUND = 2.20462;

class Insights extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {
          label: props.t("INSIGHTS.PEOPLE_FED.TITLE"),
          image: people_fed,
          route: 'PeopleFed',
          data_point: 'PeopleFed',
        },
        {
          label: props.t("INSIGHTS.SOIL_OM.TITLE"),
          image: soil_om,
          route: 'SoilOM',
          data_point: 'SoilOM',
        },
        {
          label: props.t("INSIGHTS.LABOUR_HAPPINESS.TITLE"),
          image: labour_happiness,
          route: 'LabourHappiness',
          data_point: 'LabourHappiness',
        },
        {
          label: props.t("INSIGHTS.BIODIVERSITY.TITLE"),
          image: biodiversity,
          route: 'Biodiversity',
          data_point: 'Biodiversity',
        },
        {
          label: props.t("INSIGHTS.PRICES.TITLE"),
          image: prices,
          route: 'Prices',
          data_point: 'Prices',
        },
        {
          label: props.t("INSIGHTS.WATER_BALANCE.TITLE"),
          image: water_balance,
          route: 'WaterBalance',
          data_point: 'WaterBalance',
        },
        {
          label: props.t("INSIGHTS.NITROGEN_BALANCE.TITLE"),
          image: nitrogen_balance,
          route: 'NitrogenBalance',
          data_point: 'NitrogenBalance',
        },
        //{label: "Erosion", image: erosion, route: "Erosion", data_point: "Erosion"},
      ],
    };

    this.handleClick = this.handleClick.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.generateView = this.generateView.bind(this);
  }

  renderItem(item, index, currentData) {
    return (
      <div key={index} className={'insightItem item-' + index + ' ' + styles.insightItem}>
        <div
          className={'itemButton item-' + index + ' ' + styles.itemButton}
          onClick={() => this.handleClick(item.route)}
        >
          <div className={'itemDescription item-' + index + ' ' + styles.itemDescription}>
            <img
              className={'itemIcon item-' + index + ' ' + styles.itemIcon}
              src={item.image}
              alt={item.label}
            />
            <div className={'itemText item-' + index + ' ' + styles.itemText}>
              <Semibold>{item.label}</Semibold>
              <Text>{`${this.props.t("INSIGHTS.CURRENT")}: ${currentData ? currentData : 0}`}</Text>
            </div>
          </div>
          <BsChevronRight className={styles.itemArrow} />
        </div>
        <hr className={styles.defaultLine} />
      </div>
    );
  }

  handleClick(route) {
    history.push('/Insights/' + route);
  }

  generateView(
    cropNutritionalData,
    soilOMData,
    labourHappinessData,
    biodiversityData,
    pricesData,
    waterBalanceData,
    nitrogenBalanceData,
  ) {
    const insightData = {};
    const isImperial = this.props.farm?.units?.measurement === 'imperial';
    insightData['PeopleFed'] = this.props.t("INSIGHTS.PEOPLE_FED.MEAL_COUNT", { count: cropNutritionalData.preview });
    insightData['SoilOM'] = (soilOMData.preview || '0') + '%';
    insightData['LabourHappiness'] = labourHappinessData.preview
      ? labourHappinessData.preview + '/5'
      : this.props.t("INSIGHTS.UNAVAILABLE");
    insightData['Biodiversity'] = this.props.t("INSIGHTS.BIODIVERSITY.SPECIES_COUNT", { count: biodiversityData.preview });
    insightData['Prices'] = pricesData.preview ? this.props.t("INSIGHTS.PRICES.PERCENT_OF_MARKET", { percentage: pricesData.preview }) : this.props.t("INSIGHTS.UNAVAILABLE");
    insightData['WaterBalance'] = isImperial
      ? Number(waterBalanceData.preview) * MILLIMETER_TO_INCH + ' in'
      : waterBalanceData.preview + ' mm';
    insightData['NitrogenBalance'] = isImperial
      ? Number(nitrogenBalanceData.preview) * KILOGRAM_TO_POUND + ' lbs'
      : nitrogenBalanceData.preview + ' kg';
    return insightData;
  }

  componentDidMount() {
    //TODO fetch userFarm
    this.props.dispatch(getCropsSoldNutrition());
    this.props.dispatch(getSoilOMData());
    this.props.dispatch(getLabourHappinessData());
    this.props.dispatch(getBiodiversityData());
    this.props.dispatch(
      getPricesWithDistanceData(this.props.farm.grid_points, this.props.pricesDistance),
    );
    this.props.dispatch(getWaterBalanceData());
    this.props.dispatch(getWaterBalanceSchedule());
    this.props.dispatch(getNitrogenBalanceData());
    this.props.dispatch(getFrequencyNitrogenBalance());
  }

  render() {
    // @TODO currently just throwing in data from the props into generateView, should refactor the code to handle it better
    const {
      cropNutritionData,
      soilOMData,
      labourHappinessData,
      biodiversityData,
      pricesData,
      waterBalanceData,
      nitrogenBalanceData,
    } = this.props;
    let insightData = this.generateView(
      cropNutritionData,
      soilOMData,
      labourHappinessData,
      biodiversityData,
      pricesData,
      waterBalanceData,
      nitrogenBalanceData,
    );
    const { t } = this.props;
    return (
      <div className={styles.insightContainer}>
        <div>
          <div className={styles.leftText}>
            <Title>{t('INSIGHTS.TITLE')}</Title>
          </div>
          <div className={styles.rightText}>
            <InfoBoxComponent
              customStyle={{ fontSize: '20px' }}
              title={t('INSIGHTS.TITLE')}
              body={(<div>{t('INSIGHTS.INFO')}</div>)}
            />
          </div>
        </div>
        <hr style={{ marginBottom: '0px' }} />
        <hr className={styles.defaultLineWithNoMarginTop} />

        {this.state.items.map((item, index) => {
          return this.renderItem(item, index, insightData[item.data_point]);
        })}
      </div>
    );
  }
}

// const infoBoxBody = (
//   <div>
//     {/* <h4>
//       <b>Information</b>
//     </h4> */}
//     Insights provides added data insights into what is happening on your farm. The more data you
//     provide in the application, the more insights can be generated. See individual insights for
//     further information.
//   </div>
// );

const mapStateToProps = (state) => {
  return {
    farm: userFarmSelector(state),
    cropNutritionData: cropsNutritionSelector(state),
    soilOMData: soilOMSelector(state),
    labourHappinessData: labourHappinessSelector(state),
    biodiversityData: biodiversitySelector(state),
    pricesData: pricesSelector(state),
    waterBalanceData: waterBalanceSelector(state),
    waterBalanceSchedule: waterBalanceScheduleSelector(state),
    nitrogenBalanceData: nitrogenBalanceSelector(state),
    nitrogenFrequencyData: nitrogenFrequencySelector(state),
    pricesDistance: pricesDistanceSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Insights));
