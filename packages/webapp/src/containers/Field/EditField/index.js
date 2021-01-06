import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import { connect } from 'react-redux';
import styles from './styles.scss';
import parentStyles from '../styles.scss';
import { Button, Card, Modal } from 'react-bootstrap';
import { CENTER, DEFAULT_ZOOM, FARM_BOUNDS, GMAPS_API_KEY } from '../constants';
import NewFieldCropModal from '../../../components/Forms/NewFieldCropModal/';
import { deleteField } from '../saga';
import { getExpiredFieldCrops, deleteFieldCrop } from '../saga';
import { getFieldCropsByDate } from '../../saga';
import PageTitle from '../../../components/PageTitle';
import ConfirmModal from '../../../components/Modals/Confirm';
import { toastr } from 'react-redux-toastr';
import EditFieldCropModal from '../../../components/Forms/EditFieldCropModal/EditFieldCropModal';
import { convertFromMetric, getUnit, grabCurrencySymbol, roundToTwoDecimal } from '../../../util';
import { BsPencil } from 'react-icons/all';
import { userFarmSelector } from '../../userFarmSlice';
import { getFields } from '../../saga';
import { fieldsSelector } from '../../fieldSlice';
import { putField } from './saga';
import {
  currentFieldCropsSelector,
  expiredFieldCropsSelector,
  fieldCropsSelector,
} from '../../fieldCropSlice';
import { withTranslation } from 'react-i18next';

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
    this.props.dispatch(getExpiredFieldCrops());
  }

  handleDeleteCrop(id) {
    this.setState({ showModal: true });
    this.setState({ selectedFieldCrop: id });
  }

  componentDidUpdate(prevProps) {
    if (this.props.fieldCrops !== prevProps.fieldCrops) {
      const fieldCrops = this.props.fieldCrops.filter(
        (fieldCrop) => fieldCrop.field_id === this.state.fieldId,
      );
      this.setState({ selectedFieldCrops: fieldCrops });
    }
    if (this.props.expiredFieldCrops !== prevProps.expiredFieldCrops) {
      const expiredFieldCrops = this.props.expiredFieldCrops.filter(
        (fieldCrop) => fieldCrop.field_id === this.state.fieldId,
      );
      this.setState({ selectedExpiredFieldCrops: expiredFieldCrops });
    }
    if (this.props.fields !== prevProps.fields) {
      const field = this.props.fields.filter((field) => field.field_id === this.state.fieldId)[0];
      this.setState({
        selectedField: field,
        fieldArea: field.area,
      });
    }
  }

  componentDidMount() {
    this.props.dispatch(getFields());
    this.props.dispatch(getFieldCropsByDate());
    this.props.dispatch(getExpiredFieldCrops());
    const urlVars = window.location.search.substring(1).split('&');
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
      fillOpacity: 0.35,
    });
    let bounds = new google.maps.LatLngBounds();
    polygon.getPath().forEach(function (element, index) {
      bounds.extend(element);
    });
    polygon.setMap(map);
    map.fitBounds(bounds);
  }

  getMapOptions = (maps) => {
    return {
      streetViewControl: false,
      scaleControl: false,
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
    this.setState({ showFieldNameModal: false });
  };

  openFieldNameEdit = () => {
    this.setState({ showFieldNameModal: true });
  };

  handleFieldName = (event) => {
    this.setState({
      field_name: event.target.value,
    });
  };

  deleteField = () => {
    const { fieldId } = this.state;
    if (
      window.confirm(
        'WARNING: This action will PERMANENTLY DELETE this field if it has nothing associated with it such as a shift or log. Are you sure to proceed?',
      )
    ) {
      if (window.confirm('I would like to delete this field.')) {
        this.props.dispatch(deleteField(fieldId));
      }
    }
  };

  changeFieldName = () => {
    let { selectedField, field_name } = this.state;
    if (field_name === '' || !field_name) {
      toastr.error('Field name cannot be empty');
      return;
    }
    this.props.dispatch(putField({ ...selectedField, field_name }));
    this.setState({ showFieldNameModal: false });
  };

  render() {
    //UBC Farm Title
    const CenterDiv = ({ text }) => (
      <div style={{ width: '30px', color: 'white', fontWeight: 'bold' }}>{text}</div>
    );

    // adjust map css for safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    let mapWidth, mapHeight;
    if (isSafari) {
      mapWidth = window.innerWidth * 0.9;
      mapWidth = mapWidth.toString() + 'px';
      mapHeight = window.innerWidth * 0.7;
      mapHeight = mapHeight.toString() + 'px';
    }
    // if(isSafari && gmapContainer){
    //    gmapContainer.childNodes[0].style.cssText = "width: 100px; height: 100px; margin: 0px; padding: 0px; position: relative;";
    //    console.log(gmapContainer.childNodes[0].style.cssText);
    // }

    return (
      <div className={parentStyles.logContainer}>
        <PageTitle title={this.props.t('FIELDS.EDIT_FIELD.TITLE')} backUrl="/field" />
        <NewFieldCropModal
          handler={() => {}}
          field={this.state.selectedField}
          fieldArea={this.state.fieldArea}
        />
        <div>
          <hr />
        </div>
        {this.state.selectedField && (
          <div className={styles.mapContainer} id="gmapcontainer">
            <GoogleMap
              style={{ width: '100%', height: '100%', position: 'relative' }}
              bootstrapURLKeys={{
                key: GMAPS_API_KEY,
                libraries: ['drawing', 'geometry'],
              }}
              center={this.props.center}
              zoom={this.props.zoom}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={this.handleGoogleMapApi.bind(this)}
              options={this.getMapOptions}
            >
              <CenterDiv lat={CENTER.lat} lng={CENTER.lng} text={'UBC Farm'} />
            </GoogleMap>
          </div>
        )}
        <div>
          <hr />
        </div>
        <div style={{ margin: '10px' }}>
          <div className={styles.editFieldName}>
            <h4>
              {this.props.t('FIELDS.EDIT_FIELD.NAME')}:{' '}
              {this.state.selectedField && this.state.selectedField.field_name}
            </h4>
            <BsPencil style={{ marginLeft: '10px' }} onClick={this.openFieldNameEdit} />
          </div>
          <p>
            {this.props.t('FIELDS.EDIT_FIELD.TOTAL_AREA')}:{' '}
            {roundToTwoDecimal(convertFromMetric(this.state.fieldArea, this.state.area_unit, 'm2'))}{' '}
            {this.state.area_unit_label}
            <sup>2</sup>
          </p>
          <p>
            {this.props.t('FIELDS.EDIT_FIELD.NUMBER_CROPS')}: {this.state.selectedFieldCrops.length}
          </p>
          <div style={{ height: '80%' }}>
            {this.state.selectedFieldCrops.map((crop, index) => (
              <Card key={index} border={'success'}>
                <Card.Header className={styles.cardHeaderSuccess} as="h3">
                  <div>
                    <Card.Title componentClass="h2" style={{ fontSize: '19px' }}>
                      {this.props.t(`crop:${crop.crop_translation_key}`)}
                    </Card.Title>
                    <Card.Title componentClass="h3" style={{ fontSize: '13px' }}>
                      {crop.variety
                        ? `${this.props.t('FIELDS.EDIT_FIELD.VARIETY')}:${crop.variety}`
                        : ''}
                    </Card.Title>
                  </div>

                  <div className={styles.inlineButtonContainer}>
                    <EditFieldCropModal
                      cropBeingEdited={crop}
                      handler={() => {}}
                      field={this.state.selectedField}
                      fieldArea={this.state.fieldArea}
                    />
                    <div className={styles.deleteButton}>
                      <Button
                        onClick={() => {
                          this.handleDeleteCrop(crop.field_crop_id);
                        }}
                        style={{ padding: '0 24px' }}
                      >
                        {this.props.t('common:DELETE')}
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Header className={styles.cardHeaderSuccess} as="h3">
                  <div>
                    <Card.Title style={{ fontSize: '13px' }}>
                      {this.props.t('FIELDS.EDIT_FIELD.CROP.START_DATE')}:{' '}
                      {crop.start_date && crop.start_date.split('T')[0]}
                      {this.props.t('FIELDS.EDIT_FIELD.CROP.END_DATE')}:{' '}
                      {crop.end_date && crop.end_date.split('T')[0]}
                    </Card.Title>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p>
                    {this.props.t('FIELDS.EDIT_FIELD.CROP.AREA_USED')}:{' '}
                    {roundToTwoDecimal(
                      convertFromMetric(crop.area_used, this.state.area_unit, 'm2'),
                    )}
                    {this.state.area_unit_label}
                    <sup>2</sup>
                  </p>
                  <p>
                    {this.props.t('FIELDS.EDIT_FIELD.CROP.ESTIMATED_PRODUCTION')}:{' '}
                    {roundToTwoDecimal(
                      convertFromMetric(
                        crop.estimated_production,
                        this.state.production_unit,
                        'kg',
                      ),
                    )}{' '}
                    {this.state.production_unit}
                  </p>
                  <p>
                    {this.props.t('FIELDS.EDIT_FIELD.CROP.ESTIMATED_REVENUE')}:{' '}
                    {this.state.currencySymbol}
                    {roundToTwoDecimal(crop.estimated_revenue)}
                  </p>
                </Card.Body>
              </Card>
            ))}
            <p>
              {this.props.t('FIELDS.EDIT_FIELD.CROP.NUMBER_EXPIRED')}:{' '}
              {this.state.selectedExpiredFieldCrops.length}
            </p>
            {this.state.selectedExpiredFieldCrops.map((crop, index) => (
              <Card key={index}>
                <Card.Header className={styles.panelHeading} as="h3">
                  <div>
                    <Card.Title componentClass="h2" style={{ fontSize: '19px' }}>
                      {this.props.t(`crop:${crop.crop_translation_key}`)}
                    </Card.Title>
                    <Card.Title componentClass="h3" style={{ fontSize: '13px' }}>
                      {crop.variety
                        ? `${this.props.t('FIELDS.EDIT_FIELD.VARIETY')}:${crop.variety}`
                        : ''}
                    </Card.Title>
                  </div>
                  <div className={styles.inlineButtonContainer}>
                    <EditFieldCropModal
                      cropBeingEdited={crop}
                      handler={() => {}}
                      field={this.state.selectedField}
                      fieldArea={this.state.fieldArea}
                    />
                    <div className={styles.deleteButton}>
                      <Button
                        onClick={() => {
                          this.handleDeleteCrop(crop.field_crop_id);
                        }}
                      >
                        {this.props.t('common:DELETE')}
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Header className={styles.panelHeading} as="h3">
                  <div>
                    <Card.Title componentClass="h3" style={{ fontSize: '13px' }}>
                      {this.props.t('FIELDS.EDIT_FIELD.CROP.START_DATE')}:{' '}
                      {crop.start_date && crop.start_date.split('T')[0]}
                      {this.props.t('FIELDS.EDIT_FIELD.CROP.END_DATE')}:{' '}
                      {crop.end_date && crop.end_date.split('T')[0]}
                    </Card.Title>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p>
                    {this.props.t('FIELDS.EDIT_FIELD.CROP.AREA_USED')}:{' '}
                    {roundToTwoDecimal(
                      convertFromMetric(crop.area_used, this.state.area_unit, 'm2'),
                    )}
                    {this.state.area_unit_label}
                    <sup>2</sup>
                  </p>
                  <p>
                    {this.props.t('FIELDS.EDIT_FIELD.CROP.ESTIMATED_PRODUCTION')}:{' '}
                    {roundToTwoDecimal(
                      convertFromMetric(
                        crop.estimated_production,
                        this.state.production_unit,
                        'kg',
                      ),
                    )}{' '}
                    {this.state.production_unit}
                  </p>
                  <p>
                    {this.props.t('FIELDS.EDIT_FIELD.CROP.ESTIMATED_REVENUE')}:{' '}
                    {this.state.currencySymbol}
                    {crop.estimated_revenue}
                  </p>
                </Card.Body>
              </Card>
            ))}
          </div>
          <ConfirmModal
            open={this.state.showModal}
            onClose={() => this.setState({ showModal: false })}
            onConfirm={() => {
              this.props.dispatch(deleteFieldCrop(this.state.selectedFieldCrop));
              this.setState({ showModal: false });
            }}
            message={this.props.t('FIELDS.EDIT_FIELD.CROP.DELETE_CONFIRMATION')}
          />
          <Modal show={this.state.showFieldNameModal} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{this.props.t('FIELDS.EDIT_FIELD.EDIT_NAME')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input
                id="field_name"
                type="text"
                value={this.state.field_name}
                onChange={(event) => this.handleFieldName(event)}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.changeFieldName}>{this.props.t('common:SAVE')}</Button>
              <Button onClick={this.handleClose}>{this.props.t('common:CLOSE')}</Button>
            </Modal.Footer>
          </Modal>
        </div>
        {this.state.selectedFieldCrops.length === 0 &&
          this.state.selectedExpiredFieldCrops.length === 0 && (
            <div className={styles.deleteField}>
              <button onClick={() => this.deleteField()}>
                {this.props.t('FIELDS.EDIT_FIELD.DELETE_FIELD')}
              </button>
            </div>
          )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    fields: fieldsSelector(state),
    fieldCrops: currentFieldCropsSelector(state),
    farm: userFarmSelector(state),
    expiredFieldCrops: expiredFieldCropsSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EditField));
