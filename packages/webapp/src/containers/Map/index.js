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
import { setLocationData } from '../mapSlice';

import PureMapHeader from '../../components/Map/Header';
import PureMapSuccessHeader from '../../components/Map/SuccessHeader';
import PureMapFooter from '../../components/Map/Footer';
import ExportMapModal from '../../components/Modals/ExportMapModal';
import CustomZoom from '../../components/Map/CustomZoom';
import CustomCompass from '../../components/Map/CustomCompass';
import DrawingManager from '../../components/Map/DrawingManager';
import useWindowInnerHeight from '../hooks/useWindowInnerHeight';
import useDrawingManager from './useDrawingManager';

import useMapAssetRenderer from './useMapAssetRenderer';
import { getLocations } from '../saga';
import {
  availableFilterSettingsSelector,
  mapFilterSettingSelector,
  setMapFilterHideAll,
  setMapFilterSetting,
  setMapFilterShowAll,
} from './mapFilterSettingSlice';

export default function Map({ history }) {
  const windowInnerHeight = useWindowInnerHeight();
  const { farm_name, grid_points, is_admin, farm_id } = useSelector(userFarmSelector);
  const { showMapSpotlight } = useSelector(chooseFarmFlowSelector);
  const filterSettings = useSelector(mapFilterSettingSelector);
  const roadview = !filterSettings.map_background;
  const fields = useSelector(fieldsSelector);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showSuccessHeader, setShowSuccessHeader] = useState(false);
  const [showZeroAreaWarning, setZeroAreaWarning] = useState(false);

  const [
    drawingState,
    {
      initDrawingState,
      startDrawing,
      finishDrawing,
      resetDrawing,
      closeDrawer,
      getOverlayInfo,
      reconstructOverlay,
    },
  ] = useDrawingManager();

  useEffect(() => {
    dispatch(getLocations());
  }, []);

  useEffect(() => {
    if (history.location.state) setShowSuccessHeader(true);
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
      mapTypeId: !roadview ? maps.MapTypeId.SATELLITE : maps.MapTypeId.ROADMAP,
      mapTypeControlOptions: {
        style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: maps.ControlPosition.BOTTOM_CENTER,
        mapTypeIds: [maps.MapTypeId.ROADMAP, maps.MapTypeId.SATELLITE],
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
  const { drawAssets } = useMapAssetRenderer();
  const handleGoogleMapApi = (map, maps) => {
    maps.Polygon.prototype.getPolygonBounds = function () {
      var bounds = new maps.LatLngBounds();
      this.getPath().forEach(function (element, index) {
        bounds.extend(element);
      });
      return bounds;
    };

    // Create drawing manager
    let drawingManagerInit = new maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      drawingControlOptions: {
        position: maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          maps.drawing.OverlayType.POLYGON,
          maps.drawing.OverlayType.POLYLINE,
          maps.drawing.OverlayType.MARKER,
        ],
      },
      map: map,
    });

    maps.event.addListener(drawingManagerInit, 'polygoncomplete', function (polygon) {
      const polygonAreaCheck = (path) => {
        if (Math.round(maps.geometry.spherical.computeArea(path)) === 0) setZeroAreaWarning(true);
        else setZeroAreaWarning(false);
      };
      const path = polygon.getPath();
      polygonAreaCheck(path);
      maps.event.addListener(path, 'set_at', function () {
        polygonAreaCheck(this);
      });
      maps.event.addListener(path, 'insert_at', function () {
        polygonAreaCheck(this);
      });
    });
    maps.event.addListener(drawingManagerInit, 'overlaycomplete', function (drawing) {
      finishDrawing(drawing);
      this.setDrawingMode();
    });
    initDrawingState(map, maps, drawingManagerInit, {
      POLYGON: maps.drawing.OverlayType.POLYGON,
      POLYLINE: maps.drawing.OverlayType.POLYLINE,
      MARKER: maps.drawing.OverlayType.MARKER,
    });

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
    drawAssets(map, maps, mapBounds);

    if (history.location.isStepBack) {
      reconstructOverlay();
    }
  };

  const resetSpotlight = () => {
    dispatch(endMapSpotlight(farm_id));
  };
  const [showMapFilter, setShowMapFilter] = useState(false);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClickAdd = () => {
    setShowModal(false);
    setShowMapFilter(false);
    setShowAddDrawer(!showAddDrawer);
  };

  const handleClickExport = () => {
    setShowModal(!showModal);
    setShowMapFilter(false);
    setShowAddDrawer(false);
  };

  const handleClickFilter = () => {
    setShowModal(false);
    setShowAddDrawer(false);
    setShowMapFilter(!showMapFilter);
  };

  const handleFilterMenuClick = (locationType) => {
    if (locationType === 'show_all') {
      dispatch(setMapFilterShowAll(farm_id));
    } else if (locationType === 'hide_all') {
      dispatch(setMapFilterHideAll(farm_id));
    } else {
      const payload = {};
      payload[locationType] = !filterSettings[locationType];
      payload.farm_id = farm_id;
      dispatch(setMapFilterSetting(payload));
    }
  };

  const availableFilterSettings = useSelector(availableFilterSettingsSelector);

  const handleAddMenuClick = (locationType) => {
    startDrawing(locationType);
  };

  const mapWrapperRef = useRef();

  const handleDismiss = () => {
    setShowModal(false);
  };

  const handleShowVideo = () => {
    console.log('show video clicked');
  };

  const handleCloseSuccessHeader = () => {
    setShowSuccessHeader(false);
  };

  const handleDownload = () => {
    html2canvas(mapWrapperRef.current, { useCORS: true }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `${farm_name}-export-${new Date().toISOString()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const handleShare = () => {
    html2canvas(mapWrapperRef.current, { useCORS: true }).then((canvas) => {
      const fileDataURL = canvas.toDataURL();
      dispatch(sendMapToEmail(fileDataURL));
    });
  };

  return (
    <>
      {!showMapFilter && !showAddDrawer && !drawingState.type && !showSuccessHeader && (
        <PureMapHeader
          className={styles.mapHeader}
          farmName={farm_name}
          showVideo={handleShowVideo}
        />
      )}
      {showSuccessHeader && (
        <PureMapSuccessHeader
          className={styles.mapHeader}
          closeSuccessHeader={handleCloseSuccessHeader}
          title={history.location.state}
        />
      )}
      <div className={styles.pageWrapper} style={{ height: windowInnerHeight }}>
        <div className={styles.mapContainer}>
          <div ref={mapWrapperRef} className={styles.mapContainer}>
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
            />
          </div>
          {drawingState.type && (
            <div className={styles.drawingBar}>
              <DrawingManager
                drawingType={drawingState.type}
                isDrawing={drawingState.isActive}
                onClickBack={() => {
                  setZeroAreaWarning(false);
                  resetDrawing(true);
                  closeDrawer();
                }}
                onClickTryAgain={() => {
                  setZeroAreaWarning(false);
                  resetDrawing();
                  startDrawing(drawingState.type);
                }}
                onClickConfirm={() => {
                  dispatch(setLocationData(getOverlayInfo()));
                  history.push(`/create_location/${drawingState.type}`);
                }}
                showZeroAreaWarning={showZeroAreaWarning}
              />
            </div>
          )}
        </div>

        {!drawingState.type && (
          <PureMapFooter
            className={styles.mapFooter}
            isAdmin={is_admin}
            showSpotlight={showMapSpotlight}
            resetSpotlight={resetSpotlight}
            onClickAdd={handleClickAdd}
            onClickExport={handleClickExport}
            showModal={showModal}
            setShowMapFilter={setShowMapFilter}
            showMapFilter={showMapFilter}
            setShowAddDrawer={setShowAddDrawer}
            showAddDrawer={showAddDrawer}
            handleClickFilter={handleClickFilter}
            filterSettings={filterSettings}
            onFilterMenuClick={handleFilterMenuClick}
            onAddMenuClick={handleAddMenuClick}
            availableFilterSettings={availableFilterSettings}
          />
        )}
        {showModal && (
          <ExportMapModal
            onClickDownload={handleDownload}
            onClickShare={handleShare}
            dismissModal={handleDismiss}
          />
        )}
      </div>
    </>
  );
}
