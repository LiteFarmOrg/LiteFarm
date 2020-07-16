import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import DrawingToolTipBox from '../../../components/Field/DrawingToolTipBox';
import styles from './styles.scss';
import parentStyles from '../styles.scss';
import { CENTER, DEFAULT_ZOOM, FARM_BOUNDS, CREATE_FIELD, GMAPS_API_KEY, POLYGON_BUTTON, NEXT_BUTTON, CLEAR_BUTTON, BACK_TO_STEP_ONE, POLYGON_COMPLETE } from '../constants';
import PageTitleFragment from '../../../components/PageTitleFragment';
import {Button, Glyphicon, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import { createFieldAction } from './actions';
import { connect } from 'react-redux';
import { cropSelector } from '../selectors';
import { farmSelector } from '../../selector';
import {
  DISPLAY_DEFAULT,
  DISPLAY_NONE,
} from '../constants';
import SearchBox from '../../../components/Inputs/GoogleMapSearchBox/GoogleMapSearchBox';
import history from '../../../history';
import {fieldSelector} from "../../selector";

class NewField extends Component {
  static defaultProps = {
    zoom: DEFAULT_ZOOM,
    bounds: FARM_BOUNDS,
  };
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
      fieldName: "",
      area: null,
      center: (this.props.farm === null || this.props.farm.grid_points === null) ?  CENTER : {lat: this.props.farm.grid_points.lat, lng: this.props.farm.grid_points.lng},
      showDetail: ["block"],
      isMapLoaded: false,
      isSavePlanDisabled: true,
      map: null,
      maps: null,
      showHelpBox: true,
      showToolTip: false,
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
    const {fields, farm} = this.props;

    if (!(fields && fields.length)) {
      this.setState({showToolTip: true})
    }

    if(farm && farm.grid_points && farm.grid_points.lat && farm.grid_points.lng){
      this.setState({center: {lat: farm.grid_points.lat, lng: farm.grid_points.lng}});
    }
  }

  getMapOptions = (maps) => {

    return {
      streetViewControl: false,
      scaleControl: true,
      fullscreenControl: false,
      styles: [{
        featureType: "poi.business",
        elementType: "labels",
        stylers: [{
          visibility: "off"
        }]
      }],
      gestureHandling: "greedy",
      disableDoubleClickZoom: true,
      minZoom: 10,
      maxZoom: 80,
      tilt: 0,
      center: null,
      zoom: DEFAULT_ZOOM,
      bounds: FARM_BOUNDS,

      mapTypeControl: true,
      mapTypeId: maps.MapTypeId.SATELLITE,
      mapTypeControlOptions: {
        style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: maps.ControlPosition.BOTTOM_CENTER,
        mapTypeIds: [
          maps.MapTypeId.ROADMAP,
          maps.MapTypeId.SATELLITE,
          maps.MapTypeId.HYBRID
        ]
      },

      zoomControl: true,
      clickableIcons: false
    };
  };

  getValidationState() {
    const fieldName = this.state.fieldName;
    if (fieldName.length > 0) {
      if (this.state.isSavePlanDisabled) {
        this.setState({ isSavePlanDisabled: false })
      }
      return 'success';
    }
    else {
      if (!this.state.isSavePlanDisabled) {
        this.setState({ isSavePlanDisabled: true })
      }
      return 'error'
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
    }
    fieldCrops[index] = cropBeingEdited;
    this.setState({ fieldCrops: fieldCrops});
  }
  handleYieldChange(event, index) {
    let fieldCrops = [...this.state.fieldCrops];
    let cropBeingEdited = {
      ...fieldCrops[index],
      estimated_production: event.target.value * this.state.price,
    }
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
    }
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
    //create the drawing manager
    let drawingManager = new maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      drawingControlOptions: {
        position: maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          maps.drawing.OverlayType.POLYGON,
        ]
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
      }
    });
    //drawingManager.setMap(map);

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
    maps.event.addListener(drawingManager, 'polygoncomplete', polygon => {
      let vertices = polygon.getPath().getArray().map(vertice => { return { lat: vertice.lat(), lng: vertice.lng() } });
      const updatePolygon = () => {
        vertices = polygon.getPath().getArray().map(vertice => { return { lat: vertice.lat(), lng: vertice.lng() } });
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
      maps.event.addListener(polygon.getPath(), 'dragend', function() {
        updatePolygon();
      });

      this.handlePolygonComplete(polygon, maps);
    });
    maps.event.addListener(drawingManager, 'overlaycomplete', e => this.setState({ polygon: e }));
  }

  handlePolygonComplete(polygon, maps) {
    const vertices = polygon.getPath().getArray().map(vertice => { return { lat: vertice.lat(), lng: vertice.lng() } });
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
        this.state.drawingManager.setDrawingMode(isDraw ? null : this.state.supportedDrawingModes.POLYGON);
        this.setState({ isMove: !isMove, isDraw: !isDraw });
        break;
      case CLEAR_BUTTON:
        this.state.polygon.overlay.setMap(null);
        this.state.drawingManager.setDrawingMode(this.state.supportedDrawingModes.POLYGON);
        this.setState({ isMove: false, isDraw: true, gridPoints: null, polygon: null, area: null, center: null });
        break;
      case NEXT_BUTTON:
        this.setState({ step: this.state.step + 1 });
        break;
      case BACK_TO_STEP_ONE:
        this.state.drawingManager.setDrawingMode();
        this.setState({ isMove: true, isDraw: false, gridPoints: null, polygon: null, area: null, center: null });
        break;
      case CREATE_FIELD:
        this.props.dispatch(createFieldAction(
          this.state.fieldName,
          this.state.gridPoints,
          this.state.area,
          ));
        this.setState({ isMove: true, isDraw: false, gridPoints: null, polygon: null, area: null, center: null });
        break;
      default:
        break;
    }
  }


  render() {
    const { gridPoints, isMapLoaded, map, maps } = this.state;
    //UBC Farm Title
    const CenterDiv = ({ text }) => <div style={{ width: '30px', color: 'white', fontWeight: 'bold' }}>{text}</div>;

    //Drawing Manager Buttons
    const PolygonButton = () =>
      <Button id={POLYGON_BUTTON} bsSize="lg" active={this.state.isDraw} disabled={gridPoints !== null} bsStyle="default" onClick={() => this.handleModeChange(POLYGON_BUTTON)}>
        <Glyphicon glyph="pencil" /> Draw
          </Button>;
    const ClearButton = () =>
      <Button id={CLEAR_BUTTON} bsSize="lg" disabled={gridPoints === null} bsStyle="default" onClick={() => this.handleModeChange(CLEAR_BUTTON)}>
        <Glyphicon glyph="trash" /> Redraw
          </Button>;
    const NextButton = () =>
      <Button id={NEXT_BUTTON} bsSize="lg" disabled={gridPoints === null} bsStyle="default" style={{ marginLeft: "10px", }} onClick={() => this.handleModeChange(NEXT_BUTTON)}>
        <Glyphicon glyph="ok" /> Confirm
          </Button>;
    const DrawingManager = () =>
      gridPoints === null ?
        <PolygonButton />
        :
        <div>
          <ClearButton />
          <NextButton />
        </div>
      ;

    return (
      // Important! Always set the container height explicitly
      <div>
        {this.state.step === 1 &&
        <div className={styles.fieldContainer}>
          <div className={styles.backButton}>
            <button onClick={()=>history.push('/field')}>
              <Glyphicon glyph="share-alt" style={{color:"white"}} />
            </button>
          </div>
          <div className={styles.infoButton}>
            <button onClick={() => {this.refs.child.toggleShow()}}>
              <Glyphicon glyph="glyphicon glyphicon-question-sign" style={{color: "white", fontSize: '1.7em'}}/>
            </button>
          </div>
          {isMapLoaded && <SearchBox map={map} mapsapi={maps} />}
          <GoogleMap
            bootstrapURLKeys={{
              key: GMAPS_API_KEY,
              libraries: ['drawing', 'geometry', 'places'] }}
            center={this.state.center}
            zoom={this.props.zoom}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => this.handleGoogleMapApi(map, maps)}
            options={this.getMapOptions}
          >
            <CenterDiv
              lat={CENTER.lat}
              lng={CENTER.lng}
              text={'UBC Farm'}
            />
          </GoogleMap>

          <div className={styles.drawingToolBar}>
            <DrawingManager />
          </div>
          <DrawingToolTipBox ref="child" initShow={this.state.showToolTip}/>
        </div>}
        {this.state.step === 2 &&
          <div className={parentStyles.logContainer}>
            <PageTitleFragment title="New Field (2 of 2)" onBackButtonClick={() => {
              this.handleModeChange(BACK_TO_STEP_ONE);
              this.setState({ step: this.state.step - 1 });
            }} />

            <FormGroup
              className={styles.centeredForm}
              validationState={this.getValidationState()}
            >
              <ControlLabel>Field Name</ControlLabel>
              <FormControl
                type="text"
                value={this.state.fieldName}
                placeholder="Enter Field Name"
                onChange={this.handleFieldNameChange}
                className={styles.buttonContainer}
              />
            </FormGroup>
            <FormGroup
              className={styles.centeredForm}>
              <div className={styles.buttonContainer} style={{ bottom: 0 }}>
                <Button disabled={this.state.isSavePlanDisabled} onClick={() => {
                  this.handleModeChange(CREATE_FIELD);
                  this.setState({ step: this.state.step + 1 });
                }}>Finish and Save Plan</Button>
              </div>
            </FormGroup>
          </div>}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropSelector(state),
    fields: fieldSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(NewField);
