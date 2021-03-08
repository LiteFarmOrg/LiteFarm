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

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import SlideMenu from './slideMenu';
import SmallerLogo from '../../assets/images/smaller_logo.svg';
import SmallLogo from '../../assets/images/small_logo.svg';
import NoFarmNavBar from '../../components/Navigation/NoFarmNavBar';
import styles1 from './styles1.scss';
import { chooseFarmFlowSelector } from '../ChooseFarm/chooseFarmFlowSlice';
import PureNavBar from '../../components/Navigation/NavBar';
import { useTranslation } from 'react-i18next';
import { userFarmSelector, userFarmLengthSelector } from '../userFarmSlice';
import { isAuthenticated } from '../../util/jwt';
import { endSpotLight } from '../ChooseFarm/chooseFarmFlowSlice';

const NavBar = (props) => {
  const { t } = useTranslation();
  const { history, farm, farmState, dispatch, numberOfUserFarm } = props;
  const { showSpotLight, isInvitationFlow } = farmState;
  const isFarmSelected =
    isAuthenticated() && farm && farm.has_consent && farm?.step_five === true && !isInvitationFlow;
  const farmSpotlight = t('NAVIGATION.SPOTLIGHT.FARM');
  const notificationsSpotlight = t('NAVIGATION.SPOTLIGHT.NOTIFICATION');
  const myProfileSpotlight = t('NAVIGATION.SPOTLIGHT.PROFILE');

  const returnNextButton = (str) => {
    return <span className={styles1.black}>{str}</span>;
  };

  const steps = [
    {
      target: '#firstStep',
      title: returnContent(t('NAVIGATION.SPOTLIGHT.FARM_TITLE'), true),
      content: returnContent(farmSpotlight, false),
      locale: {
        next: returnNextButton(t('common:NEXT')),
      },
      showCloseButton: false,
      disableBeacon: true,
      placement: 'right-start',
      styles: {
        options: {
          width: 240,
        },
      },
    },
    {
      target: '#secondStep',
      title: returnContent(t('NAVIGATION.SPOTLIGHT.NOTIFICATION_TITLE'), true),
      content: returnContent(notificationsSpotlight, false),
      locale: {
        next: returnNextButton(t('common:NEXT')),
      },
      showCloseButton: false,
      placement: 'right-start',
      styles: {
        options: {
          width: 260,
        },
      },
    },
    {
      target: '#thirdStep',
      title: returnContent(t('NAVIGATION.SPOTLIGHT.PROFILE_TITLE'), true),
      content: returnContent(myProfileSpotlight, false),
      locale: {
        last: returnNextButton(t('common:GOT_IT')),
      },
      placement: 'right-start',
      showCloseButton: false,
      styles: {
        options: {
          width: 210,
        },
      },
      floaterProps: {
        styles: {
          floater: {
            marginRight: '12px',
          },
        },
      },
    },
  ];

  const resetSpotlight = () => {
    dispatch(endSpotLight(farm.farm_id));
  };

  const initialState = { profile: false, myFarm: false, notification: false };
  const [tooltipInteraction, setTooltipInteraction] = useState(initialState);
  const [isOneTooltipOpen, setOneTooltipOpen] = useState(false);
  const changeInteraction = (tooltipName, onOverlay = false) => {
    const newInteraction = onOverlay
      ? initialState
      : {
          ...initialState,
          [tooltipName]: !tooltipInteraction[tooltipName],
        };
    setTooltipInteraction(newInteraction);
    setOneTooltipOpen(Object.keys(newInteraction).some((k) => newInteraction[k]));
  };

  return isFarmSelected ? (
    <PureNavBar
      logo={<Logo history={history} />}
      steps={showSpotLight && steps}
      resetSpotlight={resetSpotlight}
      isOneTooltipOpen={isOneTooltipOpen}
      changeInteraction={changeInteraction}
      showSwitchFarm={numberOfUserFarm > 1}
      tooltipInteraction={tooltipInteraction}
      history={history}
    >
      <SlideMenu right />
    </PureNavBar>
  ) : (
    <NoFarmNavBar history={history} />
  );
};

const returnContent = (spotlightType, title) => {
  return spotlightType.split(',').map(function (item, key) {
    return title ? (
      <span key={key} className={styles1.green}>
        <p align="left" className={styles1.p}>
          {item}
        </p>
      </span>
    ) : (
      <span key={key}>
        <p align="left" className={styles1.p}>
          {item}
        </p>
      </span>
    );
  });
};

const Logo = ({ history }) => {
  const isSmallScreen = useMediaQuery({ query: '(max-width: 800px)' });
  return isSmallScreen ? (
    <img src={SmallerLogo} alt="Logo" onClick={() => history.push('/')} />
  ) : (
    <img src={SmallLogo} alt="Logo" onClick={() => history.push('/')} />
  );
};

const mapStateToProps = (state) => {
  return {
    farm: userFarmSelector(state),
    farmState: chooseFarmFlowSelector(state),
    numberOfUserFarm: userFarmLengthSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
