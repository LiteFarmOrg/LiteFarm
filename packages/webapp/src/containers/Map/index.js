import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import GoogleMap from 'google-map-react';
import { DEFAULT_ZOOM, GMAPS_API_KEY } from './constants';
import { useDispatch, useSelector } from 'react-redux';
import { userFarmSelector } from '../userFarmSlice';
import { chooseFarmFlowSelector, endMapSpotlight } from '../ChooseFarm/chooseFarmFlowSlice';
import html2canvas from 'html2canvas';
import { sendMapToEmail } from './saga';
import { fieldsSelector } from '../fieldSlice';

import PureMapHeader from '../../components/Map/Header';
import PureMapFooter from '../../components/Map/Footer';
import ExportMapModal from '../../components/Modals/ExportMapModal';
import CustomZoom from '../../components/Map/CustomZoom';
import CustomCompass from '../../components/Map/CustomCompass';

import { drawArea, drawLine, drawPoint } from './mapDrawer';
import { getLocations } from '../saga';

export default function Map() {
  const { farm_name, grid_points, is_admin, farm_id } = useSelector(userFarmSelector);
  const { showMapSpotlight } = useSelector(chooseFarmFlowSelector);
  const fields = useSelector(fieldsSelector);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [stateMap, setMap] = useState(null);

  const samplePointsLine = [
    {
      lat: 40.1381877000039,
      lng: -74.97323955717772,
    },
    {
      lat: 40.13927038563383,
      lng: -74.9661585253784,
    },
    {
      lat: 40.13392240695948,
      lng: -74.97169460478514,
    },
  ];
  const samplePoint = {
    lat: 40.13592240695948,
    lng: -74.97369460478514,
  }

  useEffect(() => {
    dispatch(getLocations());
  }, []);

  const getMapOptions = (maps) => {
    return {
      styles: [
        {
          featureType: 'poi.business',
          elementType: 'labels',
          stylers: [
            {
              visibility: 'off',
            },
          ],
        },
      ],
      gestureHandling: 'greedy',
      disableDoubleClickZoom: true,
      minZoom: 1,
      maxZoom: 80,
      tilt: 0,

      mapTypeId: maps.MapTypeId.SATELLITE,
      mapTypeControlOptions: {
        style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: maps.ControlPosition.BOTTOM_CENTER,
        mapTypeIds: [maps.MapTypeId.ROADMAP, maps.MapTypeId.SATELLITE, maps.MapTypeId.HYBRID],
      },

      clickableIcons: false,
      streetViewControl: false,
      scaleControl: false,
      mapTypeControl: false,
      panControl: false,
      zoomControl: false,
      rotateControl: false,
      fullscreenControl: false,
    };
  };

  const handleGoogleMapApi = (map, maps) => {
    console.log(map);
    console.log(maps);

    setMap(map);

    // Adding custom map components
    const zoomControlDiv = document.createElement('div');
    ReactDOM.render(
      <CustomZoom
        style={{ margin: '12px' }}
        onClickZoomIn={() => map.setZoom(map.getZoom() + 1)}
        onClickZoomOut={() => map.setZoom(map.getZoom() - 1)}
      />,
      zoomControlDiv,
    );
    map.controls[maps.ControlPosition.RIGHT_BOTTOM].push(zoomControlDiv);

    const compassControlDiv = document.createElement('div');
    ReactDOM.render(<CustomCompass style={{ marginRight: '12px' }} />, compassControlDiv);
    map.controls[maps.ControlPosition.RIGHT_BOTTOM].push(compassControlDiv);

    // Drawing locations on map
    let mapBounds = new maps.LatLngBounds();

    if (fields && fields.length >= 1) {
      for (const field of fields) {
        drawArea(map, maps, mapBounds, 'field', field);
      }
      // drawLine(map, maps, mapBounds, 'example', {grid_points: samplePointsLine, name: "example line"});
      // drawPoint(map, maps, mapBounds, 'example', {grid_point: samplePoint, name: "example point"});

      // ADDING ONCLICK TO DRAWING
      // addListenersOnPolygonAndMarker(polygon, this.state.fields[i]);

      map.fitBounds(mapBounds);
    }
  }

  const resetSpotlight = () => {
    dispatch(endMapSpotlight(farm_id));
  };

  const handleClickAdd = () => {
    setShowModal(false);
  };

  const handleClickFilter = () => {
    setShowModal(false);
  };

  const handleClickExport = () => {
    setShowModal(!showModal);
  };

  const mapWrapperRef = useRef();

  const handleDismiss = () => {
    setShowModal(false);
  };

  const handleShowVideo = () => {
    console.log('show video clicked');
  };

  const handleDownload = () => {
    html2canvas(mapWrapperRef.current, { useCORS: true }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `${new Date().toISOString()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
    setShowModal(false);
  };

  const handleShare = () => {
    html2canvas(mapWrapperRef.current, { useCORS: true }).then((canvas) => {
      const fileDataURL = canvas.toDataURL();
      dispatch(sendMapToEmail(fileDataURL));
    });
    setShowModal(false);
  };

  return (
    <div className={styles.pageWrapper}>
      <PureMapHeader
        className={styles.mapHeader}
        farmName={farm_name}
        showVideo={handleShowVideo}
      />
      <div className={styles.mapContainer}>
        <div className={styles.workaround} ref={mapWrapperRef}>
          <GoogleMap
            style={{ flexGrow: 1 }}
            bootstrapURLKeys={{
              key: GMAPS_API_KEY,
              libraries: ['drawing', 'geometry', 'places'],
              language: localStorage.getItem('litefarm_lang'),
            }}
            defaultCenter={grid_points}
            defaultZoom={DEFAULT_ZOOM}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => handleGoogleMapApi(map, maps)}
            options={getMapOptions}
          ></GoogleMap>
        </div>
      </div>
      <PureMapFooter
        className={styles.mapFooter}
        isAdmin={is_admin}
        showSpotlight={showMapSpotlight}
        resetSpotlight={resetSpotlight}
        onClickAdd={handleClickAdd}
        onClickFilter={handleClickFilter}
        onClickExport={handleClickExport}
        showModal={showModal}
      />
      {showModal && (
        <ExportMapModal
          onClickDownload={handleDownload}
          onClickShare={handleShare}
          dismissModal={handleDismiss}
        />
      )}
    </div>
  );
}
