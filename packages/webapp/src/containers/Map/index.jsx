import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import GoogleMap from 'google-map-react';
import { saveAs } from 'file-saver';
import { DEFAULT_ZOOM, GMAPS_API_KEY, isArea, isLine, locationEnum } from './constants';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector, userFarmSelector } from '../userFarmSlice';
import html2canvas from 'html2canvas';
import { sendMapToEmail, setSpotlightToShown } from './saga';
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
import {
  hookFormPersistedPathsSetSelector,
  hookFormPersistSelector,
  resetAndUnLockFormData,
  setPersistedPaths,
  upsertFormData,
} from '../hooks/useHookFormPersist/hookFormPersistSlice';
import LocationSelectionModal from './LocationSelectionModal';
import { useMaxZoom } from './useMaxZoom';

export default function Map({ history }) {
  const windowInnerHeight = useWindowInnerHeight();
  const { farm_name, grid_points, is_admin, farm_id } = useSelector(userFarmSelector);
  const filterSettings = useSelector(mapFilterSettingSelector);
  const showedSpotlight = useSelector(showedSpotlightSelector);
  const roadview = !filterSettings.map_background;
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const overlayData = useSelector(hookFormPersistSelector);

  const lineTypesWithWidth = [locationEnum.buffer_zone, locationEnum.watercourse];
  const { t } = useTranslation();
  const showHeader = useSelector(setShowSuccessHeaderSelector);
  const [showSuccessHeader, setShowSuccessHeader] = useState(false);
  const [showZeroAreaWarning, setZeroAreaWarning] = useState(false);
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
    },
  ] = useDrawingManager();

  useEffect(() => {
    dispatch(getLocations());
  }, []);

  useEffect(() => {
    if (showHeader) setShowSuccessHeader(true);
  }, [showHeader]);

  const [showMapFilter, setShowMapFilter] = useState(false);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDrawAreaSpotlightModal, setShowDrawAreaSpotlightModal] = useState(false);
  const [showDrawLineSpotlightModal, setShowDrawLineSpotlightModal] = useState(false);

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
      setShowingConfirmButtons(true);
      finishDrawing(drawing, maps, map);
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
  };

  const handleClickAdd = () => {
    setShowExportModal(false);
    setShowMapFilter(false);
    setShowAddDrawer(!showAddDrawer);
  };

  const handleClickExport = () => {
    setShowExportModal(!showExportModal);
    setShowMapFilter(false);
    setShowAddDrawer(false);
  };

  const handleClickFilter = () => {
    setShowExportModal(false);
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
    setZeroAreaWarning(false);
    if (isArea(locationType) && !showedSpotlight.draw_area) {
      setShowDrawAreaSpotlightModal(true);
    } else if (isLine(locationType) && !showedSpotlight.draw_line) {
      setShowDrawLineSpotlightModal(true);
    } else if (locationEnum.sensor) {
      //handle show bulk upload modal
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
  };

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
      dispatch(upsertFormData(locationData));
      history.push(`/create_location/${drawingState.type}`);
    }
  };

  const handleLineConfirm = (lineData) => {
    setShowingConfirmButtons(false);
    const data = { ...getOverlayInfo(), ...lineData };
    dispatch(upsertFormData(data));
    history.push(`/create_location/${drawingState.type}`);
  };

  const isLineWithWidth = (type = drawingState.type) => {
    return lineTypesWithWidth.includes(type);
  };

  const { showAdjustAreaSpotlightModal, showAdjustLineSpotlightModal } = drawingState;
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
                  resetDrawing(true);
                  dispatch(resetAndUnLockFormData());
                  closeDrawer();
                  setShowingConfirmButtons(false);
                }}
                onClickTryAgain={() => {
                  setZeroAreaWarning(false);
                  resetDrawing();
                  startDrawing(drawingState.type);
                  setShowingConfirmButtons(false);
                }}
                onClickConfirm={handleConfirm}
                showZeroAreaWarning={showZeroAreaWarning}
                confirmLine={handleLineConfirm}
                updateLineWidth={setLineWidth}
                system={system}
                lineData={overlayData}
                typeOfLine={drawingState.type}
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
            setShowAddDrawer={setShowAddDrawer}
            showAddDrawer={showAddDrawer}
            handleClickFilter={handleClickFilter}
            filterSettings={filterSettings}
            onFilterMenuClick={handleFilterMenuClick}
            onAddMenuClick={handleAddMenuClick}
            availableFilterSettings={availableFilterSettings}
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
      </div>
    </>
  );
}
