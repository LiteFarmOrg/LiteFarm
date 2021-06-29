import React from 'react';
import { ReactComponent as FarmMapIcon } from '../../assets/images/farm-profile/farm-map.svg';
import { ReactComponent as FarmInfoIcon } from '../../assets/images/farm-profile/farm-info.svg';
import { ReactComponent as PeopleIcon } from '../../assets/images/farm-profile/people.svg';
import { ReactComponent as CertificationsIcon } from '../../assets/images/farm-profile/certificate.svg';
import ListOption from '../Navigation/NavBar/ListOption';
import { useTranslation } from 'react-i18next';

import Floater from 'react-floater';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../containers/userFarmSlice';

export function PureMyFarmFloaterComponent({
  farmInfo,
  farmMap,
  people,
  certification,
  isIntroducingFarmMap,
  isAdmin,
}) {
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
        icon={<FarmInfoIcon style={isIntroducingFarmMap ? { background: 'white' } : {}} />}
        customParagraphStyle={isIntroducingFarmMap ? { background: 'white' } : {}}
        customIconStyle={isIntroducingFarmMap ? { background: 'white' } : {}}
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
        icon={<PeopleIcon style={isIntroducingFarmMap ? { background: 'white' } : {}} />}
        customParagraphStyle={isIntroducingFarmMap ? { background: 'white' } : {}}
        customIconStyle={isIntroducingFarmMap ? { background: 'white' } : {}}
      />
      {isAdmin && (
        <ListOption
          clickFn={certification}
          iconText={t('MY_FARM.CERTIFICATIONS')}
          icon={<CertificationsIcon style={isIntroducingFarmMap ? { background: 'white' } : {}} />}
          customParagraphStyle={isIntroducingFarmMap ? { background: '#c7efd3' } : {}}
          customIconStyle={isIntroducingFarmMap ? { background: 'white' } : {}}
        />
      )}
    </div>
  );
}

export default function PureMyFarmFloater({
  children,
  openProfile,
  farmInfoClick,
  farmMapClick,
  peopleClick,
  certificationClick,
  isIntroducingFarmMap,
}) {
  const { is_admin } = useSelector(userFarmSelector);
  const Wrapper = (
    <PureMyFarmFloaterComponent
      farmInfo={farmInfoClick}
      farmMap={farmMapClick}
      people={peopleClick}
      certification={certificationClick}
      isIntroducingFarmMap={isIntroducingFarmMap}
      isAdmin={is_admin}
    />
  );
  return (
    <Floater
      component={Wrapper}
      placement={'bottom-end'}
      open={openProfile || isIntroducingFarmMap}
      styles={{
        floater: {
          zIndex: 1500,
          display: openProfile || isIntroducingFarmMap ? 'initial' : 'none',
        },
      }}
    >
      {children}
    </Floater>
  );
}
