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
import { setLocationData, resetLocationData } from '../mapSlice';

import PureMapHeader from '../../components/Map/Header';
import PureMapFooter from '../../components/Map/Footer';
import ExportMapModal from '../../components/Modals/ExportMapModal';
import CustomZoom from '../../components/Map/CustomZoom';
import CustomCompass from '../../components/Map/CustomCompass';
import DrawingManager from '../../components/Map/DrawingManager';
import useWindowInnerHeight from '../hooks/useWindowInnerHeight';
import useDrawingManager from './useDrawingManager';

import { drawArea, drawLine, drawPoint } from './mapDrawer';
import { getLocations } from '../saga';

export default function Map() {
  const windowInnerHeight = useWindowInnerHeight();
  const { farm_name, grid_points, is_admin, farm_id } = useSelector(userFarmSelector);
  const { showMapSpotlight } = useSelector(chooseFarmFlowSelector);
  const fields = useSelector(fieldsSelector);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const [stateMap, setMap] = useState(null);

  // drawingState: obj
  //   type: string
  //   isActive: bool
  //   supportDrawingModes: obj
  //   drawingManager: drawingManager
  //   drawingToCheck: overlay
  // initDrawingState(drawingManager, supportDrawingModes): func
  // startDrawing(type): func
  // finishDrawing(): func
  // redoDrawing: func
  // TODO: undoDrawing: func
  // const [drawingState, drawingFunctions] = useDrawingManager();
  // destructure drawingState to {type, isActive, etc.} to access different state values
  const [drawingState, {
    initDrawingState,
    startDrawing,
    finishDrawing,
    resetDrawing,
    closeDrawer,
    getOverlayInfo,
  }] = useDrawingManager();


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
  };
  let [roadview, setRoadview] = useState(false);
  const [showMapFilter, setShowMapFilter] = useState(true);
  const [height, setHeight] = useState(0);

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

  const handleGoogleMapApi = (map, maps) => {
    console.log(map);
    console.log(maps);

    setMap(map);

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

    // set polygon drawing styles (maybe set them later according to selected area?)
    // drawingManagerInit.setOptions({
    //   polygonOptions: {
    //     strokeWeight: 2,
    //     fillOpacity: 0.2,
    //     editable: true,
    //     draggable: true,
    //     fillColor: '#FFB800',
    //     strokeColor: '#FFB800',
    //     geodesic: true,
    //     suppressUndo: true,
    //   },
    // });

    // maps.event.addListener(drawingManagerInit, 'markercomplete', function(marker) {
    //   const point = marker.getPosition();
    //   setOverlayInfo({ point });
    // });
    // maps.event.addListener(drawingManagerInit, 'polylinecomplete', function(polyline) {
    //   const line_points = polyline.getPath();
    //   const length = Math.round(maps.geometry.spherical.computeLength(grid_points));
    //   const width = ???;
    //   setOverlayInfo({ line_points, length, width });
    // });
    // maps.event.addListener(drawingManagerInit, 'polygoncomplete', function(polygon) {
    //   let grid_points = polygon.getPath();
    //   const area = Math.round(maps.geometry.spherical.computeArea(grid_points));
    //   const perimeter = Math.round(maps.geometry.spherical.computeLength(grid_points));
    //   grid_points = grid_points.getArray().map((vertex) => {
    //     return { lat: vertex.lat(), lng: vertex.lng() };
    //   });
    //   setOverlayInfo({ grid_points, area, perimeter });
    // });
    maps.event.addListener(drawingManagerInit, 'overlaycomplete', function(drawing) {
      finishDrawing(drawing);
      this.setDrawingMode();
    });
    initDrawingState(maps, drawingManagerInit, {
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

    if (fields && fields.length >= 1) {
      for (const field of fields) {
        drawArea(map, maps, mapBounds, field);
      }
      // drawLine(map, maps, mapBounds, {grid_points: samplePointsLine, name: "example line", type: 'creek'});
      // drawPoint(map, maps, mapBounds, {grid_point: samplePoint, name: "example point", type: 'waterValve'});

      // ADDING ONCLICK TO DRAWING
      // addListenersOnPolygonAndMarker(polygon, this.state.fields[i]);

      map.fitBounds(mapBounds);
    }
  };

  const resetSpotlight = () => {
    dispatch(endMapSpotlight(farm_id));
  };

  const handleClickAdd = () => {
    setShowModal(false);
    setAnchorState({ bottom: false });
    setShowMapFilter(true);
    
    // startDrawing('gate') // point
    startDrawing('groundwater') // area
    // startDrawing('waterValve')
  };

  const handleClickExport = () => {
    // get this in the custom hook
    // setDrawLocationType(null);
    setShowModal(!showModal);
    setAnchorState({ bottom: false });
    setShowMapFilter(true);
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
      link.download = `${farm_name}-export-${new Date().toISOString()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const [anchorState, setAnchorState] = useState({
    bottom: false,
  });

  const toggleDrawer = (anchor, open) => () => {
    setShowModal(false);
    setShowMapFilter(!showMapFilter);
    setAnchorState({ ...anchorState, [anchor]: open });
    if (!open) setHeight(window.innerHeight / 2);
  };

  const handleShare = () => {
    html2canvas(mapWrapperRef.current, { useCORS: true }).then((canvas) => {
      const fileDataURL = canvas.toDataURL();
      dispatch(sendMapToEmail(fileDataURL));
    });
  };


  return (
    <>
      {(showMapFilter && !drawingState.type) && (
        <PureMapHeader
          className={styles.mapHeader}
          farmName={farm_name}
          showVideo={handleShowVideo}
        />
      )}
      <div className={styles.pageWrapper} style={{ height: windowInnerHeight }}>
        <div className={styles.mapContainer}>
          <div ref={mapWrapperRef}>
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
          {drawingState.type && <div className={styles.drawingBar}>
            <DrawingManager
              drawingType={drawingState.type}
              isDrawing={drawingState.isActive}
              onClickBack={() => {
                resetDrawing(true);
                closeDrawer();
              }}
              onClickTryAgain={() => {
                resetDrawing();
                startDrawing(drawingState.type);
              }}
              onClickConfirm={() => dispatch(setLocationData(getOverlayInfo()))}
            />
          </div>}
        </div>

        {!drawingState.type && <PureMapFooter
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
        />}
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
