/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
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

import React, { useEffect, Component, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import history from '../../history';
// images
import soil_om from '../../assets/images/insights/soil_om.svg';
import labour_happiness from '../../assets/images/insights/labour_happiness.svg';
import biodiversity from '../../assets/images/insights/biodiversity.svg';
import prices from '../../assets/images/insights/prices.svg';
// import erosion from '../../assets/images/insights/erosion.svg';
//
// actions
import {
  //getBiodiversityData,
  getLabourHappinessData,
  getPricesWithDistanceData,
  getSoilOMData,
} from './actions';
// selectors
import {
  // biodiversityErrorSelector,
  // biodiversityLoadingSelector,
  // biodiversitySelector,
  // cropsNutritionSelector,
  labourHappinessSelector,
  // nitrogenBalanceSelector,
  // nitrogenFrequencySelector,
  pricesDistanceSelector,
  pricesSelector,
  soilOMSelector,
  // waterBalanceScheduleSelector,
  // waterBalanceSelector,
} from './selectors';
import InfoBoxComponent from '../../components/InfoBoxComponent';
import { BsChevronRight } from 'react-icons/all';
import { userFarmSelector } from '../userFarmSlice';
import { Semibold, Text, Title } from '../../components/Typography';

const MILLIMETER_TO_INCH = 0.0393701;
const KILOGRAM_TO_POUND = 2.20462;

const Insights = () => {
  const farm = useSelector(userFarmSelector);
  const pricesDistance = useSelector(pricesDistanceSelector);
  const soilOMData = useSelector(soilOMSelector);
  const labourHappinessData = useSelector(labourHappinessSelector);
  const biodiversityData = null;
  const pricesData = useSelector(pricesSelector);
  //const biodiversityLoading = useSelector(biodiversityLoadingSelector);
  //const biodiversityError = useSelector(biodiversityErrorSelector);

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const items = [
    {
      label: t('INSIGHTS.SOIL_OM.TITLE'),
      image: soil_om,
      route: 'SoilOM',
      data_point: 'SoilOM',
    },
    {
      label: t('INSIGHTS.LABOUR_HAPPINESS.TITLE'),
      image: labour_happiness,
      route: 'LabourHappiness',
      data_point: 'LabourHappiness',
    },
    {
      label: t('INSIGHTS.BIODIVERSITY.TITLE'),
      image: biodiversity,
      route: 'Biodiversity',
      data_point: 'Biodiversity',
    },
    {
      label: t('INSIGHTS.PRICES.TITLE'),
      image: prices,
      route: 'Prices',
      data_point: 'Prices',
    },
  ];

  useEffect(() => {
    dispatch(getSoilOMData());
    dispatch(getLabourHappinessData());
    dispatch(getPricesWithDistanceData(farm.grid_points, pricesDistance));
    // if (
    //   !(
    //     biodiversityData.timeFetched &&
    //     (Date.now() - biodiversityData.timeFetched) / (1000 * 60) < 30
    //   )
    // ) {
    //   dispatch(getBiodiversityData());
    // }
  }, []);

  const handleClick = (route) => {
    history.push(`/Insights/${route}`);
  };

  const renderItem = (item, index, currentData) => (
    <div key={index} className={`insightItem item-${index} ${styles.insightItem}`}>
      <div
        className={`itemButton item-${index} ${styles.itemButton}`}
        onClick={() => handleClick(item.route)}
      >
        <img
          className={`itemIcon item-${index} ${styles.itemIcon}`}
          src={item.image}
          alt={item.label}
        />
        <div className={`itemText item-${index} ${styles.itemText}`}>
          <Semibold>{item.label}</Semibold>
          {item.label === t('INSIGHTS.BIODIVERSITY.TITLE') ? (
            <Text>{currentData}</Text>
          ) : (
            <Text>{`${t('INSIGHTS.CURRENT')}: ${currentData ?? 0}`}</Text>
          )}
        </div>
        <BsChevronRight className={styles.itemArrow} />
      </div>
      <hr className={styles.defaultLine} />
    </div>
  );

  const insightData = useMemo(() => {
    const insightData = {};
    insightData['SoilOM'] = (soilOMData.preview ?? '0') + '%';
    insightData['LabourHappiness'] = labourHappinessData.preview
      ? labourHappinessData.preview + '/5'
      : t('INSIGHTS.UNAVAILABLE');
    // if (biodiversityLoading) {
    //   insightData['Biodiversity'] = t('INSIGHTS.BIODIVERSITY.LOADING.PREVIEW');
    // } else if (biodiversityError) {
    //   insightData['Biodiversity'] = t('INSIGHTS.BIODIVERSITY.ERROR.PREVIEW');
    // } else {
    //   insightData['Biodiversity'] = t('INSIGHTS.BIODIVERSITY.SPECIES_COUNT', {
    //     count: biodiversityData.preview,
    //   });
    // }
    insightData['Biodiversity'] = t('INSIGHTS.CLICK_TO_CALCULATE');
    insightData['prices'] = pricesData.preview
      ? t('INSIGHTS.PRICES.PERCENT_OF_MARKET', { percentage: pricesData.preview })
      : t('INSIGHTS.UNAVAILABLE');
    return insightData;
  }, [soilOMData, labourHappinessData, biodiversityData, pricesData]);

  const renderedItems = useMemo(() => {
    return (
      insightData &&
      items.map((item, index) => {
        return renderItem(item, index, insightData[item.data_point]);
      })
    );
  }, [insightData]);

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
            body={<div>{t('INSIGHTS.INFO')}</div>}
          />
        </div>
      </div>
      <hr style={{ marginBottom: '0px' }} />
      <hr className={styles.defaultLineWithNoMarginTop} />
      {renderedItems}
    </div>
  );
};

// class Insight extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       items: [
//         // {
//         //   label: props.t('INSIGHTS.PEOPLE_FED.TITLE'),
//         //   image: people_fed,
//         //   route: 'PeopleFed',
//         //   data_point: 'PeopleFed',
//         // },
//         {
//           label: props.t('INSIGHTS.SOIL_OM.TITLE'),
//           image: soil_om,
//           route: 'SoilOM',
//           data_point: 'SoilOM',
//         },
//         {
//           label: props.t('INSIGHTS.LABOUR_HAPPINESS.TITLE'),
//           image: labour_happiness,
//           route: 'LabourHappiness',
//           data_point: 'LabourHappiness',
//         },
//         {
//           label: props.t('INSIGHTS.BIODIVERSITY.TITLE'),
//           image: biodiversity,
//           route: 'Biodiversity',
//           data_point: 'Biodiversity',
//         },
//         {
//           label: props.t('INSIGHTS.PRICES.TITLE'),
//           image: prices,
//           route: 'Prices',
//           data_point: 'Prices',
//         },
//         // {
//         //   label: props.t('INSIGHTS.WATER_BALANCE.TITLE'),
//         //   image: water_balance,
//         //   route: 'WaterBalance',
//         //   data_point: 'WaterBalance',
//         // },
//         // {
//         //   label: props.t('INSIGHTS.NITROGEN_BALANCE.TITLE'),
//         //   image: nitrogen_balance,
//         //   route: 'NitrogenBalance',
//         //   data_point: 'NitrogenBalance',
//         // },
//         //{label: "Erosion", image: erosion, route: "Erosion", data_point: "Erosion"},
//       ],
//     };
//
//     this.handleClick = this.handleClick.bind(this);
//     this.renderItem = this.renderItem.bind(this);
//     this.generateView = this.generateView.bind(this);
//   }
//
//   renderItem(item, index, currentData) {
//     return (
//       <div key={index} className={'insightItem item-' + index + ' ' + styles.insightItem}>
//         <div
//           className={'itemButton item-' + index + ' ' + styles.itemButton}
//           onClick={() => this.handleClick(item.route)}
//         >
//           <div className={'itemDescription item-' + index + ' ' + styles.itemDescription}>
//             <img
//               className={'itemIcon item-' + index + ' ' + styles.itemIcon}
//               src={item.image}
//               alt={item.label}
//             />
//             <div className={'itemText item-' + index + ' ' + styles.itemText}>
//               <Semibold>{item.label}</Semibold>
//               <Text>{`${this.props.t('INSIGHTS.CURRENT')}: ${currentData ? currentData : 0}`}</Text>
//             </div>
//           </div>
//           <BsChevronRight className={styles.itemArrow} />
//         </div>
//         <hr className={styles.defaultLine} />
//       </div>
//     );
//   }
//
//   handleClick(route) {
//     history.push('/Insights/' + route);
//   }
//
//   generateView(
//     cropNutritionalData,
//     soilOMData,
//     labourHappinessData,
//     biodiversityData,
//     pricesData,
//     waterBalanceData,
//     nitrogenBalanceData,
//   ) {
//     const insightData = {};
//     const isImperial = this.props.farm?.units?.measurement === 'imperial';
//     insightData['PeopleFed'] = this.props.t('INSIGHTS.PEOPLE_FED.MEAL_COUNT', {
//       count: cropNutritionalData.preview,
//     });
//     insightData['SoilOM'] = (soilOMData.preview || '0') + '%';
//     insightData['LabourHappiness'] = labourHappinessData.preview
//       ? labourHappinessData.preview + '/5'
//       : this.props.t('INSIGHTS.UNAVAILABLE');
//     insightData['Biodiversity'] = this.props.t('INSIGHTS.BIODIVERSITY.SPECIES_COUNT', {
//       count: biodiversityData.preview,
//     });
//     insightData['Prices'] = pricesData.preview
//       ? this.props.t('INSIGHTS.PRICES.PERCENT_OF_MARKET', { percentage: pricesData.preview })
//       : this.props.t('INSIGHTS.UNAVAILABLE');
//     insightData['WaterBalance'] = isImperial
//       ? Number(waterBalanceData.preview) * MILLIMETER_TO_INCH + ' in'
//       : waterBalanceData.preview + ' mm';
//     insightData['NitrogenBalance'] = isImperial
//       ? Number(nitrogenBalanceData.preview) * KILOGRAM_TO_POUND + ' lbs'
//       : nitrogenBalanceData.preview + ' kg';
//     return insightData;
//   }
//
//   componentDidMount() {
//     //TODO fetch userFarm
//     // this.props.dispatch(getCropsSoldNutrition());
//     this.props.dispatch(getSoilOMData());
//     this.props.dispatch(getLabourHappinessData());
//     this.props.dispatch(getBiodiversityData());
//     this.props.dispatch(
//       getPricesWithDistanceData(this.props.farm.grid_points, this.props.pricesDistance),
//     );
//     // this.props.dispatch(getWaterBalanceData());
//     // this.props.dispatch(getWaterBalanceSchedule());
//     // this.props.dispatch(getNitrogenBalanceData());
//     // this.props.dispatch(getFrequencyNitrogenBalance());
//   }
//
//   render() {
//     // @TODO currently just throwing in data from the props into generateView, should refactor the code to handle it better
//     const {
//       cropNutritionData,
//       soilOMData,
//       labourHappinessData,
//       biodiversityData,
//       pricesData,
//       waterBalanceData,
//       nitrogenBalanceData,
//     } = this.props;
//     let insightData = this.generateView(
//       cropNutritionData,
//       soilOMData,
//       labourHappinessData,
//       biodiversityData,
//       pricesData,
//       waterBalanceData,
//       nitrogenBalanceData,
//     );
//     const { t } = this.props;
//     return (
//       <div className={styles.insightContainer}>
//         <div>
//           <div className={styles.leftText}>
//             <Title>{t('INSIGHTS.TITLE')}</Title>
//           </div>
//           <div className={styles.rightText}>
//             <InfoBoxComponent
//               customStyle={{ fontSize: '20px' }}
//               title={t('INSIGHTS.TITLE')}
//               body={<div>{t('INSIGHTS.INFO')}</div>}
//             />
//           </div>
//         </div>
//         <hr style={{ marginBottom: '0px' }} />
//         <hr className={styles.defaultLineWithNoMarginTop} />
//
//         {this.state.items.map((item, index) => {
//           return this.renderItem(item, index, insightData[item.data_point]);
//         })}
//       </div>
//     );
//   }
// }
//
// const mapStateToProps = (state) => {
//   return {
//     farm: userFarmSelector(state),
//     cropNutritionData: cropsNutritionSelector(state),
//     soilOMData: soilOMSelector(state),
//     labourHappinessData: labourHappinessSelector(state),
//     biodiversityData: biodiversitySelector(state),
//     pricesData: pricesSelector(state),
//     waterBalanceData: waterBalanceSelector(state),
//     waterBalanceSchedule: waterBalanceScheduleSelector(state),
//     nitrogenBalanceData: nitrogenBalanceSelector(state),
//     nitrogenFrequencyData: nitrogenFrequencySelector(state),
//     pricesDistance: pricesDistanceSelector(state),
//   };
// };
//
// const mapDispatchToProps = (dispatch) => {
//   return {
//     dispatch,
//   };
// };

// export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Insights));
export default Insights;
