import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import GoogleMap from 'google-map-react';
import { DEFAULT_ZOOM, GMAPS_API_KEY, isArea, isLine, locationEnum } from '../Map/constants';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../userFarmSlice';
import useMapAssetRenderer from '../Map/useMapAssetRenderer';
import useDrawingManager from '../Map/useDrawingManager';
import { mapFilterSettingSelector } from '../Map/mapFilterSettingSlice';
import CustomZoom from '../../components/Map/CustomZoom';
import CustomCompass from '../../components/Map/CustomCompass';
import styles from './styles.module.scss';
import PageTitle from '../../components/PageTitle/v2';
import Button from '../../components/Form/Button';
import ProgressBar from '../../components/ProgressBar';
import LocationPicker from '../../components/LocationPicker';
import Layout from '../../components/Layout';

export default function PlantingLocation({ history }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  console.log(selectedLocation);

  return (
    <>
      <Layout
        buttonGroup={
          <Button disabled={false} fullLength>
            {'Continue'}
          </Button>
        }
      >
        <PageTitle title={'Add management plan'} onGoBack={() => {}} onCancel={() => {}} />
        <div
          style={{
            marginBottom: '24px',
            marginTop: '8px',
          }}
        >
          <ProgressBar value={37.5} />
        </div>
        <div className={styles.planting_label}>{'Select a planting location'}</div>
        <LocationPicker className={styles.mapContainer} setSelectedLocation={setSelectedLocation} />
        <div>
          <div className={styles.shown_label}>
            {'Only locations that can contain crops are shown'}
          </div>
        </div>
      </Layout>
    </>
  );
}
