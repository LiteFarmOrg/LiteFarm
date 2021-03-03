import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import GoogleMap from 'google-map-react';
import { DEFAULT_ZOOM, GMAPS_API_KEY } from './constants';
import { useDispatch, useSelector } from 'react-redux';
import { userFarmSelector } from '../userFarmSlice';
import { chooseFarmFlowSelector, endMapSpotlight } from '../ChooseFarm/chooseFarmFlowSlice';
import ExportMapModal from '../../components/Modals/ExportMapModal';
import html2canvas from 'html2canvas';
import { sendMapToEmail } from './saga';
import { fieldsSelector } from '../fieldSlice';

import PureMapHeader from '../../components/Map/Header';
import PureMapFooter from '../../components/Map/Footer';
import CustomZoom from '../../components/Map/CustomZoom';
import CustomCompass from '../../components/Map/CustomCompass';

export default function Map() {
  const { farm_name, grid_points, is_admin, farm_id } = useSelector(userFarmSelector);
  const { showMapSpotlight } = useSelector(chooseFarmFlowSelector);
  const fields = useSelector(fieldsSelector);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  let [roadview, setRoadview] = useState(false);
  const [showMapFilter, setShowMapFilter] = useState(true);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // setCenter(grid_points);
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
      mapTypeControl: true,
      mapTypeId: !roadview ? maps.MapTypeId.SATELLITE : maps.MapTypeId.ROADMAP,
      mapTypeControlOptions: {
        style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: maps.ControlPosition.BOTTOM_CENTER,
        mapTypeIds: [maps.MapTypeId.ROADMAP, maps.MapTypeId.SATELLITE],
      },
      zoomControl: true,
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

    // let farmBounds = new maps.LatLngBounds();
    // TODO: FILL IN HANDLE GOOGLE MAP API
  };

  const resetSpotlight = () => {
    dispatch(endMapSpotlight(farm_id));
  };

  const handleClickAdd = () => {
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
  };

  const [anchorState, setAnchorState] = React.useState({
    bottom: false,
  });

  const toggleDrawer = (anchor, open) => () => {
    setShowMapFilter(!showMapFilter);
    setAnchorState({ ...anchorState, [anchor]: open });
    if (!open) setHeight(window.innerHeight / 2);
    console.log('toggle drawer');
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
        onClickExport={handleClickExport}
        showModal={showModal}
        setHeight={setHeight}
        height={height}
        anchorState={anchorState}
        toggleDrawer={toggleDrawer}
        setRoadview={setRoadview}
        showMapFilter={showMapFilter}
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
