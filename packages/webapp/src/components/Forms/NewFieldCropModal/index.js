import React from 'react';
import { Button, Modal, FormGroup, FormControl } from 'react-bootstrap';
import { connect } from 'react-redux';
import { cropSelector } from '../NewCropModal/selectors';
import { getCrops } from '../NewCropModal/actions';
import {
  FIELD_CROPS_INIT, DEC_RADIX,
} from '../../../containers/Field/constants';
import {
  createFieldCropAction,
  createPriceAction,
  createYieldAction,
} from '../../../containers/Field/NewField/actions';
import NewCropModal from '../NewCropModal';
import styles from '../../../containers/Field/styles.scss';
import newFieldStyles from './styles.scss';
import { convertFromMetric, convertToMetric, getUnit, grabCurrencySymbol, roundToTwoDecimal } from '../../../util';
import { farmSelector } from '../../../containers/selector';
import Select from 'react-select';
import DateContainer from '../../../components/Inputs/DateContainer';
import { toastr } from 'react-redux-toastr';
import moment from 'moment';

class NewFieldCropModal extends React.Component {
  // props:
  // field: the current field selected
  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleFieldCropPropertiesChange = this.handleFieldCropPropertiesChange.bind(this);

    this.validateNotEmptyLength = this.validateNotEmptyLength.bind(this);
    this.validateWarningEmptyLength = this.validateWarningEmptyLength.bind(this);
    this.validateHasDate = this.validateHasDate.bind(this);
    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.getCropOptions = this.getCropOptions.bind(this);

    this.state = {
      show: false,
      field: null,
      crops: [],
      fieldCrop: FIELD_CROPS_INIT,
      percentage: 0,
      area_unit: getUnit(this.props.farm, 'm2', 'ft2'),
      area_unit_label: getUnit(this.props.farm, 'm', 'ft'),
      estimated_unit: getUnit(this.props.farm, 'kg', 'lb'),
      isByArea: true,
      bed_length: 0,
      bed_width: 0,
      bed_num: 1,
      yield_per_bed: 0,
      currencySymbol: grabCurrencySymbol(this.props.farm),
      clicked: {
        width: '40%',
        border: 'none',
        borderRadius: '5px',
        background: 'var(--typeAction)',
        color: 'white',
      },
      un_clicked: {
        width: '40%',
        border: 'none',
        borderRadius: '5px',
        background: '#009485',
        color: 'white',
      },
      crop_option: {},
    };
  }

  componentDidUpdate(prevProps) {
    const { crops } = this.props;
    if (crops && prevProps.crops && crops.length > prevProps.crops.length) {
      const newCrop = crops[crops.length - 1];
      this.setState(preState => ({
        fieldCrop: { ...preState.fieldCrop, crop_id: newCrop.crop_id },
        crop_option: newCrop,
      }));
    }
  }

  handleClose = () => {
    this.setState({ show: false });
  };

  handleShow() {
    this.setState({ show: true });
  }

  handleSaveCustomCrop = () => {
    this.props.dispatch(getCrops());
  };

  handleSaveNewCrop = () => {
    if (this.validateForm()) {
      const { isByArea, bed_num, bed_width, bed_length, area_unit, estimated_unit } = this.state;
      let newFieldCrop = this.state.fieldCrop;

      let estimatedProduction = isByArea ? newFieldCrop.estimated_yield * newFieldCrop.area_used : newFieldCrop.estimated_yield * bed_num;
      let estimatedRevenue = isByArea ? estimatedProduction * newFieldCrop.estimated_price : bed_num * newFieldCrop.estimated_price * newFieldCrop.estimated_yield;

      estimatedProduction = convertToMetric(estimatedProduction, estimated_unit, 'kg');

      let yieldData = {
        crop_id: newFieldCrop.crop_id,
        'quantity_kg/m2': newFieldCrop.estimated_yield,
        date: newFieldCrop.end_date,
      };

      let priceData = {
        crop_id: newFieldCrop.crop_id,
        value: newFieldCrop.estimated_price,
        date: newFieldCrop.end_date,
      };

      this.props.dispatch(createYieldAction(yieldData));
      this.props.dispatch(createPriceAction(priceData));

      let bed_config = null;
      if (!isByArea) {
        bed_config = {
          bed_length,
          bed_width,
          bed_num,
        }
      }
      this.props.dispatch(
        createFieldCropAction(
          parseInt(newFieldCrop.crop_id, DEC_RADIX),
          this.props.field.field_id,
          newFieldCrop.start_date,
          newFieldCrop.end_date,
          convertToMetric(newFieldCrop.area_used, area_unit, 'm2'),
          estimatedProduction,
          estimatedRevenue,
          !isByArea,
          bed_config,
        ));
      this.setState({ show: false });
      this.setState({ fieldCrop: FIELD_CROPS_INIT })
    }
  };


  handleFieldCropPropertiesChange(event) {
    let fieldCrop = this.state.fieldCrop;
    let cropBeingEdited = {
      ...fieldCrop,
      [event.target.id]: Number(event.target.value) >= 0 ? event.target.value : 0,
    };
    this.setState({
      fieldCrop: cropBeingEdited,
    });
  }

  validateNotEmptyLength(state) {
    if (state.length > 0) return 'success';
    return 'error'
  };

  validateWarningEmptyLength(state) {
    if (state.length > 0) return 'success';
    return 'warning';
  }

  validateHasDate(date) {
    if (date) return 'success';
    else return 'error'
  }

  validateForm() {
    const currentFieldCrop = this.state.fieldCrop;

    let { fieldArea } = this.props;

    if (this.state.area_unit === 'ft2') {
      fieldArea = roundToTwoDecimal(convertFromMetric(fieldArea, this.state.area_unit, 'm2'));
    }

    let isValid = true;
    let errors = '';

    if (moment(currentFieldCrop.end_date).isSameOrBefore(moment(currentFieldCrop.start_date))) {
      toastr.error('End Date cannot be the same or before Start Date');
      isValid = false;
      return isValid;
    }

    if (currentFieldCrop.area_used > fieldArea) {
      toastr.error('Field crop area cannot be greater than field area');
      isValid = false;
      return isValid;
    }

    for (const key in currentFieldCrop) {
      if (currentFieldCrop[key] === '') {
        isValid = false;
        errors += key + ', '
      }
    }

    if (!isValid) {
      toastr.error(errors + ' is not filled');
    } else {
      toastr.success('Successfully Saved New Crop');
    }

    return isValid
  }


  handlePercentage = (e) => {
    let { fieldCrop } = this.state;
    if (e.target.value < 0) {
      e.target.value = 0;
    }

    if (e.target.value > 100) {
      e.target.value = 100;
    }

    let { fieldArea } = this.props;

    fieldArea = roundToTwoDecimal(convertFromMetric(fieldArea, this.state.area_unit, 'm2'));
    fieldCrop.area_used = ((Number(e.target.value) / 100) * fieldArea).toFixed(0);
    this.setState({
      fieldCrop,
      percentage: Number(e.target.value),
    });
  };

  toggleAreaBed = (isByArea) => {
    let fieldCrop = this.state.fieldCrop;
    this.setState({ isByArea, fieldCrop });
  };

  onStartDateChange = (date) => {
    const currentCrop = this.state.fieldCrop;
    currentCrop.start_date = date;
    this.setState({ fieldCrop: currentCrop })
  };

  onEndDateChange = (date) => {
    const currentCrop = this.state.fieldCrop;
    currentCrop.end_date = date;
    this.setState({ fieldCrop: currentCrop })
  };

  onBedLenChange = (e) => {
    e.target.value = e.target.value >= 0 ? e.target.value : 0;
    let bed_length = e.target.value;
    let { bed_width, bed_num, fieldCrop } = this.state;
    fieldCrop.area_used = Number(bed_length) * Number(bed_width) * Number(bed_num);
    this.setState({
      fieldCrop,
      bed_length,
    });
  };

  onBedWidthChange = (e) => {
    e.target.value = e.target.value >= 0 ? e.target.value : 0;
    let bed_width = e.target.value;

    let { bed_length, bed_num, fieldCrop } = this.state;
    fieldCrop.area_used = Number(bed_length) * Number(bed_width) * Number(bed_num);
    this.setState({
      fieldCrop,
      bed_width,
    });
  };

  onBedNumChange = (e) => {
    e.target.value = e.target.value >= 0 ? e.target.value : 0;
    let bed_num = e.target.value;
    let { bed_length, bed_width, fieldCrop } = this.state;
    fieldCrop.area_used = Number(bed_length) * Number(bed_width) * Number(bed_num);
    this.setState({
      fieldCrop,
      bed_num,
    });
  };

  handleCropSelect = (crop) => {
    let fieldCrop = this.state.fieldCrop;
    if (crop && crop.value && crop.value.crop_id) {
      fieldCrop.crop_id = crop.value.crop_id;
      this.setState({ fieldCrop, crop_option: crop.value });
    } else {
      fieldCrop.crop_id = '';
      this.setState({ fieldCrop, crop_option: {} });
    }
  };

  getCropOptions = () => {
    const { crops } = this.props;
    let cropOptions = [];
    if (crops && crops.length) {
      for (let c of crops) {
        cropOptions.push({
          value: c,
          label: c.crop_common_name,
        })
      }
      cropOptions.sort((a, b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
    }
    return cropOptions;
  }

  render() {
    let { fieldArea } = this.props;
    let { isByArea, clicked, un_clicked, area_unit_label } = this.state;


    fieldArea = roundToTwoDecimal(convertFromMetric(fieldArea, this.state.area_unit, 'm2'));
    return (
      <div>
        <div className={styles.buttonContainer}>
          <Button onClick={this.handleShow}>
            New Field Crop
          </Button>
        </div>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>New Field Crop</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <FormGroup
                validationState={this.validateNotEmptyLength(this.state.fieldCrop.crop_id)}
                controlId="crop_id">
                <Select options={this.getCropOptions()}
                        value={{ value: this.state.crop_option, label: this.state.crop_option.crop_common_name }}
                        onChange={(selectedOption) => this.handleCropSelect(selectedOption)} required/>
              </FormGroup>

              <NewCropModal handler={this.handleSaveCustomCrop} isLink={true}/>

              <h4 style={{ textAlign: 'center' }}>How much of the field do you wish to use?</h4>
              <div className={styles.areaBtnContainer}>
                <button style={isByArea ? clicked : un_clicked} onClick={() => this.toggleAreaBed(true)}>By Area
                </button>
                <button style={isByArea ? un_clicked : clicked} onClick={() => this.toggleAreaBed(false)}>By Beds
                </button>
              </div>
              <div><h5 style={{ textAlign: 'right' }}>Field Size: {fieldArea} {this.state.area_unit_label}&sup2;</h5>
              </div>
              {
                isByArea && <div>
                  <FormGroup
                    validationState={this.validateNotEmptyLength(this.state.fieldCrop.area_used)}
                    className={newFieldStyles.areaContainer}>
                    <label>Percentage: </label>
                    <FormControl
                      type="number"
                      placeholder="0"
                      min={0}
                      max={100}
                      onChange={(e) => this.handlePercentage(e)}/>
                  </FormGroup>
                  <FormGroup className={newFieldStyles.areaContainer}>
                    <label>Area used in hectare: </label>
                    <FormControl
                      type="number"
                      placeholder="0"
                      disabled={true}
                      value={(this.state.fieldCrop.area_used / 10000).toFixed(2)}
                    />
                  </FormGroup>
                </div>
              }
              {
                !isByArea && <div>
                  <FormGroup
                    validationState={this.validateNotEmptyLength(this.state.bed_length)}
                    className={newFieldStyles.areaContainer}>
                    <label>Bed Length: ({area_unit_label})</label>
                    <FormControl
                      type="number"
                      placeholder={'0'}
                      min={0}
                      onChange={(e) => this.onBedLenChange(e)}
                    />
                  </FormGroup>
                  <FormGroup
                    validationState={this.validateNotEmptyLength(this.state.bed_width)}
                    className={newFieldStyles.areaContainer}>
                    <label>Bed Width: ({area_unit_label})</label>
                    <FormControl
                      type="number"
                      placeholder={'0'}
                      min={0}
                      onChange={(e) => this.onBedWidthChange(e)}
                    />
                  </FormGroup>
                  <FormGroup
                    validationState={this.validateNotEmptyLength(this.state.bed_num)}
                    className={newFieldStyles.areaContainer}>
                    <label>Number of Beds: </label>
                    <FormControl
                      type="number"
                      value={this.state.bed_num}
                      min={0}
                      onChange={(e) => this.onBedNumChange(e)}
                    />
                  </FormGroup>
                </div>
              }
              <FormGroup className={newFieldStyles.areaContainer}>
                <label>Area used in {this.state.area_unit_label}&sup2;: </label>
                <FormControl
                  type="number"
                  disabled={true}
                  value={this.state.fieldCrop.area_used}
                />
              </FormGroup>

              <h4 style={{ textAlign: 'center' }}>Enter start and finish dates</h4>
              <FormGroup controlId="start_date"
                         validationState={this.validateHasDate(this.state.fieldCrop.start_date)}
              >
                <DateContainer date={this.state.fieldCrop.start_date} onDateChange={this.onStartDateChange}
                               placeholder="Choose a start date"/>

              </FormGroup>
              <FormGroup controlId="end_date"
                         validationState={this.validateHasDate(this.state.fieldCrop.end_date)}>
                <DateContainer date={this.state.fieldCrop.end_date} onDateChange={this.onEndDateChange}
                               placeholder="Choose a end date"/>

              </FormGroup>
              <div>
                <h4 style={{ textAlign: 'center' }}>Edit estimated price for the crop
                  ({this.state.currencySymbol}/{this.state.estimated_unit})</h4>
                <FormGroup
                  validationState={this.validateNotEmptyLength(this.state.fieldCrop.estimated_price)}
                  controlId="estimated_price">
                  <FormControl
                    type="number"
                    placeholder={`Estimated Price (${this.state.currencySymbol}/${this.state.estimated_unit})`}
                    value={this.state.fieldCrop.estimated_price}
                    onChange={(e) => this.handleFieldCropPropertiesChange(e)}/>
                </FormGroup>
              </div>
              <div>
                {
                  isByArea && <h4 style={{ textAlign: 'center' }}>Edit estimated yield for the crop
                    ({this.state.estimated_unit}/{this.state.area_unit_label}&sup2;)</h4>
                }
                {
                  !isByArea && <h4 style={{ textAlign: 'center' }}>Edit estimated yield for the crop
                    ({this.state.estimated_unit}/bed)</h4>
                }

                <FormGroup controlId="estimated_yield"
                           validationState={this.validateNotEmptyLength(this.state.fieldCrop.estimated_yield)}>
                  <FormControl
                    type="number"
                    placeholder={`Estimated Yield`}
                    value={this.state.fieldCrop.estimated_yield}
                    onChange={(e) => this.handleFieldCropPropertiesChange(e)}
                  />
                </FormGroup>
              </div>

            </FormGroup>


          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                this.handleSaveNewCrop();
                this.props.handler()
              }}>Save</Button>
            <Button onClick={this.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(NewFieldCropModal);
