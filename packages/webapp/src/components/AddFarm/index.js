import Form from '../Form';
import Button from '../Form/Button';
import Input from '../Form/Input';
import PropTypes from 'prop-types';
import React from 'react';
import { Title } from '../Typography';
import { useTranslation } from 'react-i18next';
import { ReactComponent as MapPin } from '../../assets/images/signUp/map_pin.svg';
import { ReactComponent as MapErrorPin } from '../../assets/images/signUp/map_error_pin.svg';
import { ReactComponent as LoadingAnimation } from '../../assets/images/signUp/animated_loading_farm.svg';
import GoogleMap from 'google-map-react';
import {GMAPS_API_KEY} from "../../containers/Field/constants";

const style = {
  marginBottom: '28px',
};

export default function PureAddFarm({ title, inputs = [{}, {}], onSubmit, gridPoints, isGettingLocation}) {
  // const { title: titleClass, ...inputClasses } = styles;
  const { t } = useTranslation();
  return (
    <Form
      onSubmit={onSubmit}
      buttonGroup={
        <Button type={'submit'} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
    >
      <Title>{title}</Title>
      <Input style={style} {...inputs[0]} />
      <Input style={style} {...inputs[1]} />
      <div style={{width: '100vw', maxWidth:'1024px', height: '152px', position:'relative', marginLeft:'-24px',
        marginTop:'28px',marginBottom:'28px', backgroundColor:'var(--grey200)'}}>
        { gridPoints && gridPoints.lat  &&
          <GoogleMap
            defaultCenter={gridPoints}
            defaultZoom={14}
            yesIWantToUseGoogleMapApiInternals
            bootstrapURLKeys={{
              key: GMAPS_API_KEY
            }}
            options={{
              disableDoubleClickZoom: true,
              zoomControl: true,
              streetViewControl: false,
              scaleControl: true,
              fullscreenControl: false
            }}>
            <div lat={gridPoints.lat} lng={gridPoints.lng}>
                <MapPin  />
            </div>
          </GoogleMap>
         ||
          <div style={{display: 'flex', justifyContent: 'center', alignItems:'center', height:'152px' }}>
            {
              !!inputs[1].errors &&
                <MapErrorPin />
                 ||
              (
                isGettingLocation ? <LoadingAnimation />: <MapPin />
              )
            }
          </div>
        }
      </div>
    </Form>
  );
}

PureAddFarm.prototype = {
  title: PropTypes.string,
  onSubmit: PropTypes.func,
  inputs: PropTypes.arrayOf(
    PropTypes.exact({
      label: PropTypes.string,
      info: PropTypes.string,
      icon: PropTypes.node,
    }),
  ),
};
