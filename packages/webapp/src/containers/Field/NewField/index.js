import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import DrawingToolTipBox from '../../../components/Field/DrawingToolTipBox';
import styles from './styles.scss';
import parentStyles from '../styles.scss';
import {
  CENTER,
  CLEAR_BUTTON,
  DEFAULT_ZOOM,
  DISPLAY_DEFAULT,
  DISPLAY_NONE,
  GMAPS_API_KEY,
  NEXT_BUTTON,
  POLYGON_BUTTON,
  POLYGON_COMPLETE,
  TREE_ICON,
} from '../constants';
import PageTitleFragment from '../../../components/PageTitleFragment';
import { Button, FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import { connect } from 'react-redux';
import SearchBox from '../../../components/Inputs/GoogleMapSearchBox/GoogleMapSearchBox';
import history from '../../../history';
import { BsArrowLeftShort, BsCheck, BsPencil, BsQuestionCircle, BsTrash } from 'react-icons/bs';
import { userFarmSelector } from '../../userFarmSlice';
import { fieldsSelector } from '../../fieldSlice';
import { postField } from './saga';
import { withTranslation } from 'react-i18next';
import PureWarningBox from '../../../components/WarningBox';
import { Label } from '../../../components/Typography';

const buttonStyles = {
  font: 'Open Sans',
  fontSize: '16px',
  lineHeight: '24px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
  letterSpacing: '0.4005px',
  backgroundColor: '#D4DAE3',
  color: '#282B36',
  border: 'none',
  cursor: 'default',
  boxShadow: '0px 2px 8px rgba(102, 115, 138, 0.3)',
};

const activeButtonStyles = {
  backgroundColor: '#FCE38D',
  cursor: '',
};

class NewField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMove: true,
      isDraw: false,
      gridPoints: null,
      drawingManager: null,
      supportedDrawingModes: null,
      google: null, //discuss usage
      polygon: null,
      step: 1,
      fieldName: '',
      fields: this.props.fields,
      area: null,
      center:
        this.props.farm === null || this.props.farm.grid_points === null
          ? CENTER
          : {
              lat: this.props.farm.grid_points.lat,
              lng: this.props.farm.grid_points.lng,
            },
      showDetail: ['block'],
      isMapLoaded: false,
      isSavePlanDisabled: true,
      map: null,
      maps: null,
      showHelpBox: true,
      showToolTip: false,
      showWarning: false,
    };
    this.handleGoogleMapApi = this.handleGoogleMapApi.bind(this);
    this.handleModeChange = this.handleModeChange.bind(this);
    this.handlePolygonComplete = this.handlePolygonComplete.bind(this);
    this.handleFieldNameChange = this.handleFieldNameChange.bind(this);
    this.handleFieldCropPropertiesChange = this.handleFieldCropPropertiesChange.bind(this);
    this.handleShowHideDetailToggle = this.handleShowHideDetailToggle.bind(this);
    this.handleYieldChange = this.handleYieldChange.bind(this);
    this.handlePriceChange = this.handlePriceChange.bind(this);
    this.getValidationState = this.getValidationState.bind(this);
  }

  componentDidMount() {
    const { fields, farm } = this.props;

    if (!(fields && fields.length)) {
      this.setState({ showToolTip: true });
    }

    if (farm && farm.grid_points && farm.grid_points.lat && farm.grid_points.lng) {
      this.setState({
        center: { lat: farm.grid_points.lat, lng: farm.grid_points.lng },
      });
    }
  }

  getMapOptions = (maps) => {
    return {
      streetViewControl: false,
      scaleControl: true,
      fullscreenControl: false,
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
      minZoom: 10,
      maxZoom: 80,
      tilt: 0,
      center: null,

      mapTypeControl: true,
      mapTypeId: maps.MapTypeId.SATELLITE,
      mapTypeControlOptions: {
        style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: maps.ControlPosition.BOTTOM_CENTER,
        mapTypeIds: [maps.MapTypeId.ROADMAP, maps.MapTypeId.SATELLITE, maps.MapTypeId.HYBRID],
      },

      zoomControl: true,
      clickableIcons: false,
    };
  };

  getValidationState() {
    const fieldName = this.state.fieldName;
    if (fieldName.length > 0) {
      if (this.state.isSavePlanDisabled) {
        this.setState({ isSavePlanDisabled: false });
      }
      return 'success';
    } else {
      if (!this.state.isSavePlanDisabled) {
        this.setState({ isSavePlanDisabled: true });
      }
      return 'warning';
    }
  }

  handleFieldNameChange(event) {
    this.setState({ fieldName: event.target.value });
  }
  handleFieldCropPropertiesChange(event, index) {
    let fieldCrops = [...this.state.fieldCrops];
    let cropBeingEdited = {
      ...fieldCrops[index],
      [event.target.id]: event.target.value,
    };
    fieldCrops[index] = cropBeingEdited;
    this.setState({ fieldCrops: fieldCrops });
  }
  handleYieldChange(event, index) {
    let fieldCrops = [...this.state.fieldCrops];
    let cropBeingEdited = {
      ...fieldCrops[index],
      estimated_production: event.target.value * this.state.price,
    };
    fieldCrops[index] = cropBeingEdited;
    this.setState({
      fieldCrops: fieldCrops,
      [event.target.id]: event.target.value,
    });
  }
  handlePriceChange(event, index) {
    let fieldCrops = [...this.state.fieldCrops];
    let cropBeingEdited = {
      ...fieldCrops[index],
      estimated_production: event.target.value * this.state.yield,
    };
    fieldCrops[index] = cropBeingEdited;
    this.setState({
      fieldCrops: fieldCrops,
      [event.target.id]: event.target.value,
    });
  }
  handleShowHideDetailToggle(event, index) {
    const showDetail = this.state.showDetail;
    const prevState = showDetail[index];
    showDetail[index] = prevState === DISPLAY_NONE ? DISPLAY_DEFAULT : DISPLAY_NONE;
    this.setState({ showDetail: showDetail });
  }

  handleGoogleMapApi(map, maps) {
    let len = 0;
    let fieldIcon = {
      path: TREE_ICON,
      fillColor: styles.primaryColor,
      fillOpacity: 0,
      strokeWeight: 0,
      scale: 0.5,
    };

    // Create the drawing manager
    let drawingManager = new maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      drawingControlOptions: {
        position: maps.ControlPosition.TOP_CENTER,
        drawingModes: [maps.drawing.OverlayType.POLYGON],
      },
      map: map,
    });

    drawingManager.setOptions({
      polygonOptions: {
        strokeWeight: 2,
        fillOpacity: 0.2,
        editable: true,
        draggable: true,
        fillColor: '#FFB800',
        strokeColor: '#FFB800',
        geodesic: true,
        suppressUndo: true,
      },
    });

    maps.Polygon.prototype.getPolygonBounds = function () {
      var bounds = new maps.LatLngBounds();
      this.getPath().forEach(function (element, index) {
        bounds.extend(element);
      });
      return bounds;
    };

    let addListenersOnPolygonAndMarker = function (polygon, fieldObject) {
      // creates field marker
      var fieldMarker = new maps.Marker({
        position: polygon.getPolygonBounds().getCenter(),
        map: map,
        icon: fieldIcon,
        label: { text: fieldObject.field_name, color: 'white' },
      });

      // attach on click listeners
      //activeInfoWindow = null;

      function pushToHist() {
        history.push('./edit_field?' + fieldObject.field_id);
      }

      fieldMarker.setMap(map);

      maps.event.addListener(fieldMarker, 'click', function (event) {
        pushToHist();
      });
      maps.event.addListener(polygon, 'click', function (event) {
        pushToHist();
      });
    };

    if (this.state.fields && this.state.fields.length >= 1) {
      len = this.state.fields.length;
      let i;

      for (i = 0; i < len; i++) {
        // creates the polygon to be displayed on the map
        var polygon = new maps.Polygon({
          paths: this.state.fields[i].grid_points,
          strokeColor: styles.primaryColor,
          strokeOpacity: 0.8,
          strokeWeight: 3,
          fillColor: styles.primaryColor,
          fillOpacity: 0.35,
        });
        polygon.setMap(map);
        addListenersOnPolygonAndMarker(polygon, this.state.fields[i]);
      }
    }
    this.setState({
      drawingManager: drawingManager,
      supportedDrawingModes: {
        MOVE: null,
        POLYGON: maps.drawing.OverlayType.POLYGON,
      },
      map,
      maps,
      isMapLoaded: true,
    });
    maps.event.addListener(drawingManager, 'polygoncomplete', (polygon) => {
      let vertices = polygon
        .getPath()
        .getArray()
        .map((vertice) => {
          return { lat: vertice.lat(), lng: vertice.lng() };
        });
      const area = Math.round(maps.geometry.spherical.computeArea(polygon.getPath()));
      console.log(area);
      const updatePolygon = () => {
        vertices = polygon
          .getPath()
          .getArray()
          .map((vertice) => {
            return { lat: vertice.lat(), lng: vertice.lng() };
          });
        this.setState({
          gridPoints: vertices,
          area: Math.round(maps.geometry.spherical.computeArea(polygon.getPath())),
        });
      };
      maps.event.addListener(polygon.getPath(), 'set_at', function () {
        updatePolygon();
      });
      maps.event.addListener(polygon.getPath(), 'insert_at', function () {
        updatePolygon();
      });
      maps.event.addListener(polygon.getPath(), 'dragend', function () {
        updatePolygon();
      });

      if (area === 0) {
        this.setState({ showWarning: true });
      }

      this.handlePolygonComplete(polygon, maps);
    });
    if (this.state.polygon) {
      this.state.polygon.overlay.setMap(map);
    }
    maps.event.addListener(drawingManager, 'overlaycomplete', (e) => this.setState({ polygon: e }));
  }

  handlePolygonComplete(polygon, maps) {
    const vertices = polygon
      .getPath()
      .getArray()
      .map((vertice) => {
        return { lat: vertice.lat(), lng: vertice.lng() };
      });
    // console.log(Math.round(maps.geometry.spherical.computeArea(polygon.getPath())));
    this.handleModeChange(POLYGON_COMPLETE);
    this.setState({
      gridPoints: vertices,
      area: Math.round(maps.geometry.spherical.computeArea(polygon.getPath())),
    });
  }
  //Drawing Manager change mode
  handleModeChange(mode) {
    switch (mode) {
      case POLYGON_COMPLETE:
        this.state.drawingManager.setDrawingMode();
        this.setState({ isMove: false, isDraw: true });
        break;
      case POLYGON_BUTTON:
        let isDraw = this.state.isDraw;
        let isMove = this.state.isMove;
        this.state.drawingManager.setDrawingMode(
          isDraw ? null : this.state.supportedDrawingModes.POLYGON,
        );
        this.setState({ isMove: !isMove, isDraw: !isDraw });
        break;
      case CLEAR_BUTTON:
        this.state.polygon.overlay.setMap(null);
        this.state.drawingManager.setDrawingMode(this.state.supportedDrawingModes.POLYGON);
        this.setState({
          isMove: false,
          isDraw: true,
          gridPoints: null,
          polygon: null,
          area: null,
          showWarning: false,
        });
        break;
      case NEXT_BUTTON:
        this.setState({ step: this.state.step + 1 });
        break;
      case 'CREATE_FIELD':
        this.props.dispatch(
          postField({
            field_name: this.state.fieldName,
            grid_points: this.state.gridPoints,
            area: this.state.area,
          }),
        );
        this.setState({ isMove: true, isDraw: false, gridPoints: null, polygon: null, area: null });
        break;
      default:
        break;
    }
  }

  render() {
    const { gridPoints, isMapLoaded, map, maps } = this.state;
    //UBC Farm Title
    const CenterDiv = ({ text }) => (
      <div style={{ width: '30px', color: 'white', fontWeight: 'bold' }}>{text}</div>
    );

    //Drawing Manager Buttons
    const PolygonButton = () => (
      <Button
        id={POLYGON_BUTTON}
        size={'lg'}
        active={this.state.isDraw}
        disabled={this.state.isDraw}
        variant="default"
        onClick={() => this.handleModeChange(POLYGON_BUTTON)}
      >
        <BsPencil />
        {this.props.t('FIELDS.NEW_FIELD.DRAW')}
      </Button>
    );
    const ClearButton = () => (
      <Button
        id={CLEAR_BUTTON}
        size={'lg'}
        disabled={gridPoints === null}
        variant="default"
        onClick={() => this.handleModeChange(CLEAR_BUTTON)}
      >
        <BsTrash />
        {this.props.t('FIELDS.NEW_FIELD.REDRAW')}
      </Button>
    );
    const NextButton = () => (
      <Button
        id={NEXT_BUTTON}
        size={'lg'}
        disabled={gridPoints === null}
        variant="default"
        style={{ marginLeft: '10px' }}
        onClick={() => this.handleModeChange(NEXT_BUTTON)}
      >
        <BsCheck />
        {this.props.t('common:CONFIRM')}
      </Button>
    );
    const DrawingManager = () => {
      if (this.state.showWarning) {
        return <PureWarningBox style={{ padding: '16px 15%', width: '95%', margin: 'auto' }}>
          {/* <div style={{marginBottom: '10px'}}> */}
          <Label style={{marginBottom: '12px'}}>{this.props.t('FIELDS.NEW_FIELD.ZERO_AREA_DETECTED')}</Label>
          {/* </div> */}
          <ClearButton />
        </PureWarningBox>
      } else if (gridPoints === null)  {
        return <PolygonButton />
      } else {
        return <div>
          <ClearButton />
          <NextButton />
        </div>
      }
    }
      // gridPoints === null ? (
      //   <PolygonButton />
      // ) : (
      //   <div>
      //     <ClearButton />
      //     <NextButton />
      //   </div>
      // );
    return (
      // Important! Always set the container height explicitly
      <div>
        {this.state.step === 1 && (
          <div className={styles.fieldContainer}>
            <div className={styles.backButton}>
              <button onClick={() => history.push('/field')}>
                <BsArrowLeftShort size={'lg'} style={{ color: 'white' }} />
              </button>
            </div>
            <div className={styles.infoButton}>
              <button
                onClick={() => {
                  this.refs.child.toggleShow();
                }}
              >
                <BsQuestionCircle style={{ color: 'white', fontSize: '1.7em' }} />
              </button>
            </div>
            {isMapLoaded && <SearchBox map={map} mapsapi={maps} />}
            <GoogleMap
              bootstrapURLKeys={{
                key: GMAPS_API_KEY,
                libraries: ['drawing', 'geometry', 'places'],
              }}
              center={this.state.center}
              zoom={DEFAULT_ZOOM}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map, maps }) => this.handleGoogleMapApi(map, maps)}
              options={this.getMapOptions}
            >
              <CenterDiv lat={CENTER.lat} lng={CENTER.lng} text={'UBC Farm'} />
            </GoogleMap>

            <div className={styles.drawingToolBar}>
              <DrawingManager />
            </div>
            <DrawingToolTipBox ref="child" initShow={this.state.showToolTip} />
          </div>
        )}
        {this.state.step === 2 && (
          <div className={parentStyles.logContainer}>
            <PageTitleFragment
              title={this.props.t('FIELDS.NEW_FIELD.TITLE')}
              onBackButtonClick={() => {
                this.setState({ step: this.state.step - 1 });
              }}
            />
            <FormGroup className={styles.centeredForm} validationState={this.getValidationState()}>
              <FormLabel>{this.props.t('FIELDS.NEW_FIELD.FIELD_NAME')}</FormLabel>
              {this.state.isSavePlanDisabled ? (
                <FormControl
                  type="text"
                  autoFocus
                  value={this.state.fieldName}
                  placeholder={this.props.t('FIELDS.NEW_FIELD.FIELD_NAME_PLACEHOLDER')}
                  onChange={this.handleFieldNameChange}
                  className={styles.buttonContainer}
                  style={{ borderColor: '#D4DAE3' }}
                />
              ) : (
                <FormControl
                  type="text"
                  autoFocus
                  value={this.state.fieldName}
                  onChange={this.handleFieldNameChange}
                  className={styles.buttonContainer}
                  style={{ borderColor: '#89D1C7' }}
                />
              )}
            </FormGroup>
            <FormGroup className={styles.centeredForm}>
              <div className={styles.buttonContainer} style={{ bottom: 0 }}>
                {this.state.isSavePlanDisabled ? (
                  <Button style={{ ...buttonStyles }} outline>
                    {this.props.t('FIELDS.NEW_FIELD.SAVE_FIELD')}
                  </Button>
                ) : (
                  <Button
                    style={{ ...buttonStyles, ...activeButtonStyles }}
                    outline
                    onClick={() => {
                      this.handleModeChange('CREATE_FIELD');
                      this.setState({ step: this.state.step + 1 });
                    }}
                  >
                    {this.props.t('FIELDS.NEW_FIELD.SAVE_FIELD')}
                  </Button>
                )}
              </div>
            </FormGroup>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    fields: fieldsSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(NewField));
