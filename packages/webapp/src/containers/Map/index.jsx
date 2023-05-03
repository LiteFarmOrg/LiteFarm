import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import GoogleMap from 'google-map-react';
import { saveAs } from 'file-saver';
import {
  DEFAULT_ZOOM,
  GMAPS_API_KEY,
  isArea,
  isLine,
  locationEnum,
  SENSOR_BULK_UPLOAD_SUCCESS,
} from './constants';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector, userFarmSelector } from '../userFarmSlice';
import html2canvas from 'html2canvas';
import {
  sendMapToEmail,
  setSpotlightToShown,
  bulkUploadSensorsInfoFile,
  getSensorReadings,
  getAllSensorReadingTypes,
  resetBulkUploadSensorsInfoFile,
  resetShowTransitionModalState,
} from './saga';
import {
  canShowSuccessHeader,
  setShowSuccessHeaderSelector,
  setSuccessMessageSelector,
} from '../mapSlice';
import { showedSpotlightSelector } from '../showedSpotlightSlice';

import PureMapHeader from '../../components/Map/Header';
import { PureSnackbarWithoutBorder } from '../../components/PureSnackbar';
import PureMapFooter from '../../components/Map/Footer';
import ExportMapModal from '../../components/Modals/ExportMapModal';
import DrawAreaModal from '../../components/Map/Modals/DrawArea';
import DrawLineModal from '../../components/Map/Modals/DrawLine';
import AdjustAreaModal from '../../components/Map/Modals/AdjustArea';
import AdjustLineModal from '../../components/Map/Modals/AdjustLine';
import BulkSensorUploadModal from '../../components/Map/Modals/BulkSensorUploadModal';
import BulkUploadTransitionModal from '../../components/Modals/BulkUploadTransitionModal';
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
  isMapFilterSettingActiveSelector,
} from './mapFilterSettingSlice';
import {
  hookFormPersistedPathsSetSelector,
  hookFormPersistSelector,
  resetAndUnLockFormData,
  setPersistedPaths,
  upsertFormData,
  setIsRedrawing,
  hookFormPersistIsRedrawingSelector,
} from '../hooks/useHookFormPersist/hookFormPersistSlice';
import {
  bulkSensorsUploadSliceSelector,
  bulkSensorsUploadReInit,
} from '../../containers/bulkSensorUploadSlice';
import LocationSelectionModal from './LocationSelectionModal';
import { useMaxZoom } from './useMaxZoom';
import { sensorSelector } from '../sensorSlice';
import {
  mapAddDrawerSelector,
  setMapAddDrawerHide,
  setMapAddDrawerShow,
} from './mapAddDrawerSlice';

export default function Map({ history }) {
  const windowInnerHeight = useWindowInnerHeight();
  const { farm_name, grid_points, is_admin, farm_id } = useSelector(userFarmSelector);
  const filterSettings = useSelector(mapFilterSettingSelector);
  const mapAddDrawer = useSelector(mapAddDrawerSelector);
  const isMapFilterSettingActive = useSelector(isMapFilterSettingActiveSelector);
  const showedSpotlight = useSelector(showedSpotlightSelector);
  const roadview = !filterSettings.map_background;
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const overlayData = useSelector(hookFormPersistSelector);
  const bulkSensorsUploadResponse = useSelector(bulkSensorsUploadSliceSelector);
  const sensors = useSelector(sensorSelector);
  const [gMap, setGMap] = useState(null);
  const [gMaps, setGMaps] = useState(null);
  const [gMapBounds, setGMapBounds] = useState(null);
  const isRedrawing = useSelector(hookFormPersistIsRedrawingSelector);

  const lineTypesWithWidth = [locationEnum.buffer_zone, locationEnum.watercourse];
  const { t } = useTranslation();
  const showHeader = useSelector(setShowSuccessHeaderSelector);
  const [showSuccessHeader, setShowSuccessHeader] = useState(false);
  const successMessage = useSelector(setSuccessMessageSelector);

  const [showingConfirmButtons, setShowingConfirmButtons] = useState(
    history?.location?.state?.hideLocationPin ?? false,
  );

  const initialLineData = {
    [locationEnum.watercourse]: {
      width: 1,
      buffer_width: 15,
    },
    [locationEnum.buffer_zone]: {
      width: 8,
    },
  };
  const persistedPathsSet = useSelector(hookFormPersistedPathsSetSelector);
  useEffect(() => {
    return () => {
      persistedPathsSet.size &&
        !persistedPathsSet.has(history.location.pathname) &&
        dispatch(resetAndUnLockFormData());
    };
  }, [persistedPathsSet]);
  useEffect(() => {
    if (!history.location.state?.isStepBack) {
      dispatch(resetAndUnLockFormData());
    }
    return () => {
      dispatch(canShowSuccessHeader(false));
    };
  }, []);

  useEffect(() => {
    if (bulkSensorsUploadResponse?.isBulkUploadSuccessful) {
      setShowBulkSensorUploadModal(false);
    }
  }, [bulkSensorsUploadResponse?.isBulkUploadSuccessful]);

  useEffect(() => {
    setShowBulkSensorUploadModal(false);
  }, [bulkSensorsUploadResponse?.showTransitionModal]);

  useEffect(() => {
    if (history.location.state?.notification_type === SENSOR_BULK_UPLOAD_SUCCESS) {
      dispatch(setMapFilterShowAll(farm_id));
    }
  }, []);

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
      setLineWidth,
      setShowAdjustAreaSpotlightModal,
      setShowAdjustLineSpotlightModal,
      setZeroAreaWarning,
      setShowZeroLengthWarning,
    },
  ] = useDrawingManager();

  useEffect(() => {
    if (drawingState.pointChanged) dispatch(setIsRedrawing(true));
  }, [drawingState.pointChanged]);

  useEffect(() => {
    dispatch(getLocations());
  }, []);

  useEffect(() => {
    if (showHeader) setShowSuccessHeader(true);
  }, [showHeader]);

  const showAddDrawer = mapAddDrawer.addDrawer;

  const [showMapFilter, setShowMapFilter] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDrawAreaSpotlightModal, setShowDrawAreaSpotlightModal] = useState(false);
  const [showDrawLineSpotlightModal, setShowDrawLineSpotlightModal] = useState(false);
  const [showBulkSensorUploadModal, setShowBulkSensorUploadModal] = useState(false);

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
      disableDoubleClickZoom: false,
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
  const { drawAssets } = useMapAssetRenderer({
    isClickable: !drawingState.type,
    drawingState: drawingState,
    showingConfirmButtons: showingConfirmButtons,
  });
  const { getMaxZoom } = useMaxZoom();
  const handleGoogleMapApi = (map, maps) => {
    getMaxZoom(maps);
    maps.Polygon.prototype.getPolygonBounds = function () {
      var bounds = new maps.LatLngBounds();
      this.getPath().forEach(function (element, index) {
        bounds.extend(element);
      });
      return bounds;
    };
    maps.Polygon.prototype.getAveragePoint = function () {
      const latLngArray = this.getPath().getArray();
      let latSum = 0;
      let lngSum = 0;
      for (const latLng of latLngArray) {
        latSum += latLng.lat();
        lngSum += latLng.lng();
      }
      return new maps.LatLng(latSum / latLngArray.length, lngSum / latLngArray.length);
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
        if (Math.round(maps.geometry.spherical.computeArea(path)) === 0) {
          setZeroAreaWarning(true);
          setShowAdjustAreaSpotlightModal(false);
        } else setZeroAreaWarning(false);
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
    maps.event.addListener(drawingManagerInit, 'polylinecomplete', function (polyline) {
      const polylineLengthCheck = (path) => {
        if (Math.round(maps.geometry.spherical.computeLength(path)) === 0) {
          setShowZeroLengthWarning(true);
          setShowAdjustLineSpotlightModal(false);
        } else {
          setShowZeroLengthWarning(false);
        }
      };
      const path = polyline.getPath();
      polylineLengthCheck(path);
      maps.event.addListener(path, 'set_at', function () {
        polylineLengthCheck(this);
      });
      maps.event.addListener(path, 'insert_at', function () {
        polylineLengthCheck(this);
      });
    });
    maps.event.addListener(drawingManagerInit, 'overlaycomplete', function (drawing) {
      setShowingConfirmButtons(true);
      finishDrawing(drawing, maps, map);
      this.setDrawingMode();
      dispatch(setMapAddDrawerHide(farm_id));
    });
    initDrawingState(map, maps, drawingManagerInit, {
      POLYGON: maps.drawing.OverlayType.POLYGON,
      POLYLINE: maps.drawing.OverlayType.POLYLINE,
      MARKER: maps.drawing.OverlayType.MARKER,
    });

    // Adding custom map components
    const zoomControlDiv = document.createElement('div');
    const rootZoomControlDiv = createRoot(zoomControlDiv);
    rootZoomControlDiv.render(
      <CustomZoom
        style={{ margin: '12px' }}
        onClickZoomIn={() => map.setZoom(map.getZoom() + 1)}
        onClickZoomOut={() => map.setZoom(map.getZoom() - 1)}
      />,
    );
    map.controls[maps.ControlPosition.RIGHT_BOTTOM].push(zoomControlDiv);

    const compassControlDiv = document.createElement('div');
    const rootCompassControlDiv = createRoot(compassControlDiv);
    rootCompassControlDiv.render(<CustomCompass style={{ marginRight: '12px' }} />);
    map.controls[maps.ControlPosition.RIGHT_BOTTOM].push(compassControlDiv);

    // Drawing locations on map
    let mapBounds = new maps.LatLngBounds();
    const bounds = drawAssets(map, maps, mapBounds);

    if (history.location.state?.isStepBack) {
      reconstructOverlay();
    }

    if (history.location.state?.cameraInfo) {
      const { zoom, location } = history.location.state.cameraInfo;
      if (zoom && location) {
        map.setZoom(zoom);
        map.setCenter(location);
      }
    }
    setGMap(map);
    setGMaps(maps);
    setGMapBounds(bounds);
  };

  const handleClickAdd = () => {
    setShowExportModal(false);
    setShowMapFilter(false);
    dispatch(showAddDrawer ? setMapAddDrawerHide(farm_id) : setMapAddDrawerShow(farm_id));
  };

  const handleClickExport = () => {
    setShowExportModal(!showExportModal);
    setShowMapFilter(false);
    dispatch(setMapAddDrawerHide(farm_id));
  };

  const handleClickFilter = () => {
    setShowExportModal(false);
    dispatch(setMapAddDrawerHide(farm_id));
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

  useEffect(() => {
    dispatch(getSensorReadings());
    dispatch(getAllSensorReadingTypes());
  }, []);

  const handleAddMenuClick = (locationType) => {
    setZeroAreaWarning(false);
    setShowZeroLengthWarning(false);
    if (isArea(locationType) && !showedSpotlight.draw_area) {
      setShowDrawAreaSpotlightModal(true);
    } else if (isLine(locationType) && !showedSpotlight.draw_line) {
      setShowDrawLineSpotlightModal(true);
    } else if (locationType === locationEnum.sensor) {
      dispatch(showAddDrawer ? setMapAddDrawerHide(farm_id) : setMapAddDrawerShow(farm_id));
      setShowBulkSensorUploadModal(true);
      dispatch(resetBulkUploadSensorsInfoFile());
      return;
    }
    isLineWithWidth(locationType) && dispatch(upsertFormData(initialLineData[locationType]));
    const submitPath = `/create_location/${locationType}`;
    dispatch(setPersistedPaths([submitPath, '/map']));
    startDrawing(locationType);
  };

  const mapWrapperRef = useRef();

  const handleShowVideo = () => {
    history.push('/map/videos');
  };

  const handleCloseSuccessHeader = () => {
    dispatch(canShowSuccessHeader(false));
    setShowSuccessHeader(false);
    if (bulkSensorsUploadResponse?.isBulkUploadSuccessful) {
      dispatch(bulkSensorsUploadReInit());
    }
  };

  useEffect(() => {
    if (gMap && gMaps && gMapBounds) {
      const newBounds = drawAssets(gMap, gMaps, gMapBounds);
      setGMapBounds(newBounds);
    }
  }, [sensors]);

  const handleDownload = () => {
    html2canvas(mapWrapperRef.current, { useCORS: true }).then((canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, `${farm_name}-export-${new Date().toISOString()}.png`);
      });
    });
  };

  const handleShare = () => {
    html2canvas(mapWrapperRef.current, { useCORS: true }).then((canvas) => {
      const fileDataURL = canvas.toDataURL();
      dispatch(sendMapToEmail(fileDataURL));
    });
  };

  const handleConfirm = () => {
    setShowingConfirmButtons(false);
    if (!isLineWithWidth()) {
      const locationData = getOverlayInfo();
      if (Object.keys(overlayData).length === 0 || isRedrawing === true) {
        dispatch(upsertFormData(locationData));
        dispatch(setIsRedrawing(false));
      }
      history.push(`/create_location/${drawingState.type}`);
    }
  };

  const handleLineConfirm = (lineData) => {
    setShowingConfirmButtons(false);
    if (!overlayData.hasOwnProperty('type') || isRedrawing === true) {
      dispatch(upsertFormData({ ...lineData, ...getOverlayInfo() }));
      dispatch(setIsRedrawing(false));
    } else {
      dispatch(upsertFormData({ ...lineData }));
    }
    history.push(`/create_location/${drawingState.type}`);
  };

  const isLineWithWidth = (type = drawingState.type) => {
    return lineTypesWithWidth.includes(type);
  };

  const dismissBulkSensorsUploadModal = () => {
    setShowBulkSensorUploadModal(false);
    dispatch(setMapAddDrawerShow(farm_id));
  };

  const {
    showAdjustAreaSpotlightModal,
    showAdjustLineSpotlightModal,
    showZeroAreaWarning,
    showZeroLengthWarning,
  } = drawingState;

  return (
    <>
      {!showMapFilter && !showAddDrawer && !drawingState.type && !showSuccessHeader && (
        <PureMapHeader
          className={styles.mapHeader}
          farmName={farm_name}
          showVideo={handleShowVideo}
          isAdmin={is_admin}
        />
      )}
      {showSuccessHeader && (
        <PureSnackbarWithoutBorder
          className={styles.mapHeader}
          onDismiss={handleCloseSuccessHeader}
          title={successMessage}
        />
      )}
      <div
        data-cy="map-selection"
        className={styles.pageWrapper}
        style={{ height: windowInnerHeight }}
      >
        <div className={styles.mapContainer}>
          <div data-cy="map-mapContainer" ref={mapWrapperRef} className={styles.mapContainer}>
            <GoogleMap
              data-cy="google-map"
              style={{ flexGrow: 1 }}
              bootstrapURLKeys={{
                key: GMAPS_API_KEY,
                libraries: ['drawing', 'geometry', 'places'],
                language: localStorage.getItem('litefarm_lang'),
              }}
              center={grid_points}
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
                showLineModal={isLineWithWidth() && !drawingState.isActive}
                onClickBack={() => {
                  setZeroAreaWarning(false);
                  setShowZeroLengthWarning(false);
                  resetDrawing(true);
                  dispatch(resetAndUnLockFormData());
                  closeDrawer();
                  setShowingConfirmButtons(false);
                }}
                onClickTryAgain={() => {
                  setZeroAreaWarning(false);
                  setShowZeroLengthWarning(false);
                  resetDrawing();
                  startDrawing(drawingState.type);
                  setShowingConfirmButtons(false);
                  dispatch(setIsRedrawing(true));
                }}
                onClickConfirm={handleConfirm}
                showZeroAreaWarning={showZeroAreaWarning}
                showZeroLengthWarning={showZeroLengthWarning}
                confirmLine={handleLineConfirm}
                updateLineWidth={setLineWidth}
                system={system}
                lineData={overlayData}
                typeOfLine={drawingState.type}
                onLineParameterChange={() => {
                  dispatch(setIsRedrawing(true));
                }}
              />
            </div>
          )}
        </div>
        <LocationSelectionModal history={history} />

        {!drawingState.type && (
          <PureMapFooter
            isAdmin={is_admin}
            showSpotlight={!showedSpotlight.map}
            resetSpotlight={() => dispatch(setSpotlightToShown('map'))}
            onClickAdd={handleClickAdd}
            onClickExport={handleClickExport}
            showModal={showExportModal}
            setShowMapFilter={setShowMapFilter}
            showMapFilter={showMapFilter}
            setShowAddDrawer={(showAddDrawer) => {
              dispatch(showAddDrawer ? setMapAddDrawerHide(farm_id) : setMapAddDrawerShow(farm_id));
            }}
            showAddDrawer={showAddDrawer}
            handleClickFilter={handleClickFilter}
            filterSettings={filterSettings}
            onFilterMenuClick={handleFilterMenuClick}
            onAddMenuClick={handleAddMenuClick}
            availableFilterSettings={availableFilterSettings}
            isMapFilterSettingActive={isMapFilterSettingActive}
          />
        )}
        {showExportModal && (
          <ExportMapModal
            onClickDownload={handleDownload}
            onClickShare={handleShare}
            dismissModal={() => setShowExportModal(false)}
          />
        )}
        {showDrawAreaSpotlightModal && (
          <DrawAreaModal
            dismissModal={() => {
              setShowDrawAreaSpotlightModal(false);
              dispatch(setSpotlightToShown('draw_area'));
            }}
          />
        )}
        {showDrawLineSpotlightModal && (
          <DrawLineModal
            dismissModal={() => {
              setShowDrawLineSpotlightModal(false);
              dispatch(setSpotlightToShown('draw_line'));
            }}
          />
        )}
        {showAdjustAreaSpotlightModal && (
          <AdjustAreaModal
            dismissModal={() => {
              setShowAdjustAreaSpotlightModal(false);
              dispatch(setSpotlightToShown('adjust_area'));
            }}
          />
        )}
        {showAdjustLineSpotlightModal && (
          <AdjustLineModal
            dismissModal={() => {
              setShowAdjustLineSpotlightModal(false);
              dispatch(setSpotlightToShown('adjust_line'));
            }}
          />
        )}
        {showBulkSensorUploadModal && (
          <BulkSensorUploadModal
            dismissModal={dismissBulkSensorsUploadModal}
            onUpload={(file) => {
              const payload = { file };
              dispatch(bulkUploadSensorsInfoFile(payload));
            }}
          />
        )}
        {(bulkSensorsUploadResponse?.showTransitionModal ?? false) && (
          <BulkUploadTransitionModal
            dismissModal={() => {
              dispatch(resetShowTransitionModalState());
            }}
          />
        )}
      </div>
    </>
  );
}
