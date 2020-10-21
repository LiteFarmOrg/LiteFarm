import React, {Component} from "react";
import GoogleMap from 'google-map-react';
import {connect} from 'react-redux';
import styles from './styles.scss';
import parentStyles from '../styles.scss';
import {Button, Card, Modal} from 'react-bootstrap';
import {fieldSelector, cropSelector as fieldCropSelector, farmSelector} from "../../selector";
import {expiredCropSelector} from "../selectors";
import {CENTER, DEFAULT_ZOOM, FARM_BOUNDS, GMAPS_API_KEY} from '../constants';
import NewFieldCropModal from '../../../components/Forms/NewFieldCropModal/';
import {deleteFieldCrop, deleteField, getExpiredCrops} from "../actions";
import {getFieldCropsByDate, getFields} from '../../actions';
import {updateField} from './actions';
import PageTitle from "../../../components/PageTitle";
import ConfirmModal from "../../../components/Modals/Confirm";
import {toastr} from "react-redux-toastr";
import EditFieldCropModal from '../../../components/Forms/EditFieldCropModal/EditFieldCropModal';
import {convertFromMetric, getUnit, grabCurrencySymbol, roundToTwoDecimal} from "../../../util";
import { BsPencil } from "react-icons/all";

class EditField extends Component {
  static defaultProps = {
    center: CENTER,
    zoom: DEFAULT_ZOOM,
    bounds: FARM_BOUNDS,
  };

  constructor(props) {
    super(props);
    this.state = {
      fieldId: null,
      selectedField: null,
      selectedFieldCrops: [],
      selectedExpiredFieldCrops: [],
      selectedFieldCrop: null,
      fieldArea: 0,
      showModal: false, // for confirming deleting a crop
      showFieldNameModal: false,
      area_unit: getUnit(this.props.farm, 'm2', 'ft2'),
      area_unit_label: getUnit(this.props.farm, 'm', 'ft'),
      production_unit: getUnit(this.props.farm, 'kg', 'lb'),
      field_name: '',
      currencySymbol: grabCurrencySymbol(this.props.farm),
    };

    this.handleGoogleMapApi = this.handleGoogleMapApi.bind(this);
    this.handleAddCrop = this.handleAddCrop.bind(this);
    this.handleDeleteCrop = this.handleDeleteCrop.bind(this);
    //this.handleConfirmDeleteCrop = this.handleConfirmDeleteCrop.bind(this);
  }

  handleAddCrop() {
    this.props.dispatch(getFieldCropsByDate());
    this.props.dispatch(getExpiredCrops());
  }

  handleDeleteCrop(id) {
    this.setState({showModal: true});
    this.setState({selectedFieldCrop: id});
  }

  // handleConfirmDeleteCrop() {
  //   this.props.dispatch(deleteFieldCrop(this.state.selectedFieldCrop, this.state.fieldId));
  //   this.setState({ showModal: false });
  //   this.props.dispatch(getFieldCrops());
  // }

  componentDidUpdate(prevProps) {
    if (this.props.fieldCrops !== prevProps.fieldCrops) {
      const fieldCrops = this.props.fieldCrops.filter(fieldCrop => fieldCrop.field_id === this.state.fieldId);
      this.setState({selectedFieldCrops: fieldCrops})
    }
    if (this.props.expiredFieldCrops !== prevProps.expiredFieldCrops) {
      const expiredFieldCrops = this.props.expiredFieldCrops.filter(fieldCrop => fieldCrop.field_id === this.state.fieldId);
      this.setState({selectedExpiredFieldCrops: expiredFieldCrops})
    }
    if (this.props.fields !== prevProps.fields) {
      const field = this.props.fields.filter(field => field.field_id === this.state.fieldId)[0];
      this.setState({
        selectedField: field,
        fieldArea: field.area
      });
    }
  }

  componentDidMount() {
    this.props.dispatch(getFields());
    this.props.dispatch(getFieldCropsByDate());
    this.props.dispatch(getExpiredCrops());
    const urlVars = window.location.search.substring(1).split("&");
    const fieldId = urlVars[0];
    this.setState({
      fieldId: fieldId,
    });
  }

  handleGoogleMapApi(google) {
    const currentField = this.state.selectedField;
    let map = google.map;
    let polygon = new google.maps.Polygon({
      paths: currentField.grid_points,
      strokeColor: '#FFB800',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#FFB800',
      fillOpacity: 0.35
    });
    let bounds = new google.maps.LatLngBounds();
    polygon.getPath().forEach(function (element, index) {
      bounds.extend(element)
    });
    polygon.setMap(map);
    map.fitBounds(bounds);
  }

  getMapOptions = (maps) => {
    return {
      streetViewControl: false,
      scaleControl: false,
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
      minZoom: 11,
      maxZoom: 20,
      tilt: 0,
      draggable: false,
      center: CENTER,
      zoom: DEFAULT_ZOOM,
      bounds: FARM_BOUNDS,
      disableDefaultUI: true,
      mapTypeId: maps.MapTypeId.SATELLITE,
      clickableIcons: false,
    };
  };


  handleClose = () => {
    this.setState({showFieldNameModal: false});
  };

  openFieldNameEdit = () => {
    this.setState({showFieldNameModal: true});
  };

  handleFieldName = (event) => {
    this.setState({
      field_name: event.target.value
    })

  };

  deleteField = () => {
    const {fieldId} = this.state;
    if(window.confirm('WARNING: This action will PERMANENTLY DELETE this field if it has nothing associated with it such as a shift or log. Are you sure to proceed?')){
      if(window.confirm('I would like to delete this field.')){
        this.props.dispatch(deleteField(fieldId));
      }
    }
  };

  changeFieldName = ()=>{
    let {selectedField, field_name} = this.state;
    if(field_name === '' || !field_name){
      toastr.error('Field name cannot be empty');
      return;
    }
    selectedField.field_name = field_name;
    this.props.dispatch(updateField(selectedField));
    this.setState({showFieldNameModal: false});
  };

  render() {
    //UBC Farm Title
    const CenterDiv = ({text}) => <div style={{width: '30px', color: 'white', fontWeight: 'bold'}}>{text}</div>;

    // adjust map css for safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    let mapWidth, mapHeight;
    if(isSafari){
      mapWidth = window.innerWidth * 0.90;
      mapWidth = mapWidth.toString() + 'px';
      mapHeight = window.innerWidth * 0.70;
      mapHeight = mapHeight.toString() + 'px'
    }
    // if(isSafari && gmapContainer){
    //    gmapContainer.childNodes[0].style.cssText = "width: 100px; height: 100px; margin: 0px; padding: 0px; position: relative;";
    //    console.log(gmapContainer.childNodes[0].style.cssText);
    // }

    return (
      <div className={parentStyles.logContainer}>
        <PageTitle title="Edit Field" backUrl="/field"/>
        <NewFieldCropModal handler={() => {}} field={this.state.selectedField}
                           fieldArea={this.state.fieldArea}/>
        <div>
          <hr/>
        </div>
        {

          this.state.selectedField &&
          <div className={styles.mapContainer} id="gmapcontainer" >
            <GoogleMap
              style={isSafari ? {width: mapWidth, height: mapHeight, position: 'relative'} : {width: '100%', height: '100%', position: 'relative'}}
              bootstrapURLKeys={{
                key: GMAPS_API_KEY,
                libraries: ['drawing', 'geometry']
              }}
              center={this.props.center}
              zoom={this.props.zoom}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={this.handleGoogleMapApi.bind(this)}
              options={this.getMapOptions}
            >
              <CenterDiv
                lat={CENTER.lat}
                lng={CENTER.lng}
                text={'UBC Farm'}
              />
            </GoogleMap>
          </div>
        }
        <div>
          <hr/>
        </div>
        <div style={{margin: "10px"}}>
          <div className={styles.editFieldName}>
            <h4>Field Name: {this.state.selectedField && this.state.selectedField.field_name}</h4>
            <BsPencil style={{marginLeft: '10px'}} onClick={this.openFieldNameEdit} />
          </div>
          <p>Total
            Area: {roundToTwoDecimal(convertFromMetric(this.state.fieldArea, this.state.area_unit, 'm2'))} {this.state.area_unit_label}<sup>2</sup>
          </p>
          <p>Number of Crops: {this.state.selectedFieldCrops.length}</p>
          <div style={{height: "80%"}}>
            {
              this.state.selectedFieldCrops.map((crop, index) => (
                <Card key={index} border={"success"}>
                  <Card.Header className={styles.panelHeading} as="h3">
                    <div>
                      <Card.Title
                        componentClass="h2" style={{fontSize: '19px'}}>{crop.crop_common_name}
                      </Card.Title>
                      <Card.Title
                        componentClass="h3" style={{fontSize: '13px'}}>{crop.variety ? "Variety: " + crop.variety : ""}

                      </Card.Title>
                    </div>

                      <div className={styles.inlineButtonContainer}>
                        <EditFieldCropModal cropBeingEdited={crop} handler={() => {}}
                                            field={this.state.selectedField} fieldArea={this.state.fieldArea}
                        />
                        <div className={styles.deleteButton}>
                          <Button onClick={() => {
                            this.handleDeleteCrop(crop.field_crop_id)
                          }}>Delete</Button>
                        </div>
                      </div>


                  </Card.Header>
                  <Card.Header className={styles.panelHeading} as="h3">
                    <div>
                      <Card.Title
                         style={{fontSize: '13px'}}>Start
                        Date: {crop.start_date && crop.start_date.split("T")[0]} End
                        Date: {crop.end_date && crop.end_date.split("T")[0]}
                      </Card.Title>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <p>Area
                      Used: {roundToTwoDecimal(convertFromMetric(crop.area_used, this.state.area_unit, 'm2'))}{this.state.area_unit_label}<sup>2</sup>
                    </p>
                    <p>Estimated
                      Production: {roundToTwoDecimal(convertFromMetric(crop.estimated_production, this.state.production_unit, 'kg'))} {this.state.production_unit}</p>
                    <p>Estimated Revenue: {this.state.currencySymbol}{roundToTwoDecimal(crop.estimated_revenue)}</p>
                  </Card.Body>
                </Card>))
            }
            <p>Number of Expired Crops: {this.state.selectedExpiredFieldCrops.length}</p>
            {
              this.state.selectedExpiredFieldCrops.map((crop, index) => (
                <Card key={index}>
                  <Card.Header className={styles.panelHeading} as="h3">
                    <div>
                      <Card.Title
                        componentClass="h2" style={{fontSize: '19px'}}>{crop.crop_common_name}
                      </Card.Title>
                      <Card.Title
                        componentClass="h3" style={{fontSize: '13px'}}>{crop.variety ? "Variety: " + crop.variety : ""}

                      </Card.Title>
                    </div>
                    <div className={styles.inlineButtonContainer}>
                      <EditFieldCropModal cropBeingEdited={crop} handler={() => {}}
                                          field={this.state.selectedField} fieldArea={this.state.fieldArea}
                      />
                      <div className={styles.deleteButton}>
                        <Button onClick={() => {
                          this.handleDeleteCrop(crop.field_crop_id)
                        }}>Delete</Button>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Header className={styles.panelHeading} as="h3">
                    <div>
                      <Card.Title
                        componentClass="h3" style={{fontSize: '13px'}}>Start
                        Date: {crop.start_date && crop.start_date.split("T")[0]} End
                        Date: {crop.end_date && crop.end_date.split("T")[0]}
                      </Card.Title>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <p>Area
                      Used: {roundToTwoDecimal(convertFromMetric(crop.area_used, this.state.area_unit, 'm2'))}{this.state.area_unit_label}<sup>2</sup>
                    </p>
                    <p>Estimated
                      Production: {roundToTwoDecimal(convertFromMetric(crop.estimated_production, this.state.production_unit, 'kg'))} {this.state.production_unit}</p>
                    <p>Estimated Revenue: {this.state.currencySymbol}{crop.estimated_revenue}</p>
                  </Card.Body>
                </Card>))
            }
          </div>
          <ConfirmModal
            open={this.state.showModal}
            onClose={() => this.setState({showModal: false})}
            onConfirm={() => {
              this.props.dispatch(deleteFieldCrop(this.state.selectedFieldCrop, this.state.fieldId));
              this.setState({showModal: false});
            }}
            message='Are you sure you want to delete this field crop?'
          />
          <Modal show={this.state.showFieldNameModal} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Field Name</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input id="field_name" type="text" value={this.state.field_name} onChange={(event) => this.handleFieldName(event)}/>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.changeFieldName}>Save</Button>
              <Button onClick={this.handleClose}>Close</Button>
            </Modal.Footer>
          </Modal>
        </div>
        {
          this.state.selectedFieldCrops.length === 0 && this.state.selectedExpiredFieldCrops.length === 0 &&  <div className={styles.deleteField}>
            <button onClick={()=>this.deleteField()}>Delete Field</button>
          </div>
        }

      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    fields: fieldSelector(state),
    fieldCrops: fieldCropSelector(state),
    farm: farmSelector(state),
    expiredFieldCrops: expiredCropSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(EditField);
