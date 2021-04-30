import React from 'react';
import { ReactComponent as FarmMapIcon } from '../../assets/images/farm-profile/farm-map.svg';
import { ReactComponent as FarmInfoIcon } from '../../assets/images/farm-profile/farm-info.svg';
import { ReactComponent as PeopleIcon } from '../../assets/images/farm-profile/people.svg';
import ListOption from '../Navigation/NavBar/ListOption';
import { useTranslation } from 'react-i18next';

import Floater from 'react-floater';

export function PureMyFarmFloaterComponent({ farmInfo, farmMap, people, isIntroducingFarmMap }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        maxWidth: '148px',
        minWidth: '138px',
        backgroundColor: 'white',
        borderRadius: '4px',
        marginRight: '-4px',
      }}
    >
      <ListOption
        clickFn={farmInfo}
        iconText={t('MY_FARM.FARM_INFO')}
        icon={<FarmInfoIcon />}
      />
      <ListOption
        clickFn={farmMap}
        iconText={t('MY_FARM.FARM_MAP')}
        icon={<FarmMapIcon />}
        customParagraphStyle={isIntroducingFarmMap ? { background: '#c7efd3' } : {}}
      />
      <ListOption
        clickFn={people}
        iconText={t('MY_FARM.PEOPLE')}
        icon={<PeopleIcon />}
      />
    </div>
  );
}

export default function PureMyFarmFloater({
  children,
  openProfile,
  farmInfoClick,
  farmMapClick,
  peopleClick,
  isIntroducingFarmMap,
}) {
  const Wrapper = (
    <PureMyFarmFloaterComponent
      farmInfo={farmInfoClick}
      farmMap={farmMapClick}
      people={peopleClick}
      isIntroducingFarmMap={isIntroducingFarmMap}
    />
  );
  return (
    <Floater
      component={Wrapper}
      placement={'bottom-end'}
      open={openProfile || isIntroducingFarmMap}
      styles={{
        floater: { zIndex: 1500, display: openProfile || isIntroducingFarmMap ? 'initial' : 'none' },
      }}
    >
      {children}
    </Floater>
  );
}
