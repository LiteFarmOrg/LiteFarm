import React from 'react';
import { Button, Modal, FormGroup, FormControl } from 'react-bootstrap';
import { connect } from 'react-redux';
import { cropSelector } from '../../../containers/Field/selectors';
import { getCrops } from '../../../containers/Field/actions';
import { createPriceAction, createYieldAction } from '../../../containers/Field/NewField/actions';
import { editFieldCropAction } from '../../../containers/Field/EditField/actions';
import { DEC_RADIX } from '../../../containers/Field/constants';
import { convertFromMetric, getUnit, roundToTwoDecimal, convertToMetric } from '../../../util';
import DateContainer from '../../../components/Inputs/DateContainer';
import { toastr } from 'react-redux-toastr';
import moment from 'moment';
import { userFarmSelector } from '../../../containers/userFarmSlice';

class EditFieldCropModal extends React.Component {
  // props:

  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleFieldCropPropertiesChange = this.handleFieldCropPropertiesChange.bind(this);
    this.handleValuesReset = this.handleValuesReset.bind(this);
    this.handleSubmitEditFieldCrop = this.handleSubmitEditFieldCrop.bind(this);


    this.state = {
      show: false,
      field: null,
      crops: [],
      isByArea: true,
      bed_config: null,
      fieldCrop: this.props.cropBeingEdited,
      area_unit: getUnit(this.props.farm, 'm2', 'ft2'),
      area_unit_label: getUnit(this.props.farm, 'm', 'ft'),
      estimated_unit: getUnit(this.props.farm, 'kg', 'lb'),
      percentage: 0,
    };
  }

  componentDidMount() {
    const {
      dispatch,
    } = this.props;
    const { estimated_unit, area_unit } = this.state;

    dispatch(getCrops());
    let fieldCrop = JSON.parse(JSON.stringify(this.state.fieldCrop));
    fieldCrop.estimated_yield = roundToTwoDecimal(
      convertFromMetric(fieldCrop.estimated_production, estimated_unit, 'kg')
      /
      convertFromMetric(fieldCrop.area_used, area_unit, 'm2'));

    fieldCrop.estimated_price = fieldCrop.estimated_production <= 0 ? 0 : roundToTwoDecimal(fieldCrop.estimated_revenue / convertFromMetric(fieldCrop.estimated_production, estimated_unit, 'kg'));

    this.setState({
      fieldCrop,
      crops: this.props.crops,
    });


  }

  componentDidUpdate(prevProps) {
    if (this.props.crops !== prevProps.crops) {
      this.setState({
        crops: this.props.crops,
      });
      this.handleValuesReset();
    }
  }

  handleClose = () => {
    this.setState({ show: false });
  };

  handleShow() {
    this.setState({ show: true });
    this.handleValuesReset();
  }

  // handleSaveCustomCrop = () => {
  //     this.props.dispatch(getCrops());
  // };

  handleSubmitEditFieldCrop = () => {
    const { bed_config, isByArea, estimated_unit, area_unit } = this.state;
    let editedFieldCrop = this.state.fieldCrop;

    let { fieldArea } = this.props;

    if (this.state.area_unit === 'ft2') {
      fieldArea = roundToTwoDecimal(convertFromMetric(fieldArea, this.state.area_unit, 'm2'));
    }

    if (moment(editedFieldCrop.end_date).isSameOrBefore(moment(editedFieldCrop.start_date))) {
      toastr.error('End Date cannot be the same or before Start Date');
      return;
    }

    if (editedFieldCrop.area_used > fieldArea) {
      toastr.error('Field crop area cannot be greater than field area');
      return;
    }

    let estimatedProduction = isByArea ? editedFieldCrop.estimated_yield * editedFieldCrop.area_used : editedFieldCrop.estimated_yield * bed_config.bed_num;
    let estimatedRevenue = isByArea ? estimatedProduction * editedFieldCrop.estimated_price : bed_config.bed_num * editedFieldCrop.estimated_price * editedFieldCrop.estimated_yield;

    estimatedProduction = convertToMetric(estimatedProduction, estimated_unit, 'kg');

    let yieldData = {
      crop_id: editedFieldCrop.crop_id,
      'quantity_kg/m2': editedFieldCrop.estimated_yield,
      date: moment().format(),
    };

    let priceData = {
      crop_id: editedFieldCrop.crop_id,
      value: editedFieldCrop.estimated_price,
      date: moment().format(),
    };

    this.props.dispatch(createYieldAction(yieldData));
    this.props.dispatch(createPriceAction(priceData));
    this.props.dispatch(
      editFieldCropAction(
        parseInt(this.props.cropBeingEdited.field_crop_id, DEC_RADIX),
        parseInt(editedFieldCrop.crop_id, DEC_RADIX),
        this.props.cropBeingEdited.field_id,
        editedFieldCrop.start_date,
        editedFieldCrop.end_date,
        convertToMetric(editedFieldCrop.area_used, area_unit, 'm2'),
        estimatedProduction,
        editedFieldCrop.variety || '',
        estimatedRevenue,
        !isByArea,
        bed_config,
      ));
    this.setState({ show: false });

    this.handleValuesReset();
  };

  handleFieldCropPropertiesChange(event) {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    let fieldCrop = this.state.fieldCrop;
    let cropBeingEdited = {
      ...fieldCrop,
      [event.target.id]: event.target.value,
    };
    this.setState({
      fieldCrop: cropBeingEdited,
    });
  }

  handleValuesReset() {
    let fieldCrop = JSON.parse(JSON.stringify(this.props.cropBeingEdited));
    let is_by_bed = fieldCrop.is_by_bed;
    let bed_config = fieldCrop.bed_config;
    const { estimated_unit, area_unit } = this.state;

    let percentage = 0;
    if (is_by_bed) {
      fieldCrop.estimated_yield = bed_config.bed_num <= 0 ? 0 : roundToTwoDecimal(convertFromMetric(fieldCrop.estimated_production, estimated_unit, 'kg') / bed_config.bed_num);
      fieldCrop.estimated_price = fieldCrop.estimated_production <= 0 ? 0 : roundToTwoDecimal(fieldCrop.estimated_revenue / bed_config.bed_num / fieldCrop.estimated_yield);
    } else {
      fieldCrop.estimated_yield = roundToTwoDecimal(
        convertFromMetric(fieldCrop.estimated_production, estimated_unit, 'kg')
        /
        convertFromMetric(fieldCrop.area_used, area_unit, 'm2'));

      fieldCrop.estimated_price = fieldCrop.estimated_production <= 0 ? 0 :
        roundToTwoDecimal(
          fieldCrop.estimated_revenue
          /
          convertFromMetric(fieldCrop.estimated_production, estimated_unit, 'kg'));

      percentage = Number(((fieldCrop.area_used / this.props.fieldArea) * 100).toFixed(2));
    }

    fieldCrop.area_used = roundToTwoDecimal(convertFromMetric(fieldCrop.area_used, area_unit, 'm2'));

    this.setState({
      fieldCrop: fieldCrop,
      isByArea: !fieldCrop.is_by_bed,
      bed_config: fieldCrop.bed_config,
      percentage,
    });
  }

  onBedLenChange = (e) => {
    e.target.value = e.target.value >= 0 ? e.target.value : 0;
    let bed_length = e.target.value;
    let { bed_config, fieldCrop } = this.state;
    fieldCrop.area_used = Number(bed_length) * Number(bed_config.bed_width) * Number(bed_config.bed_num);
    bed_config.bed_length = bed_length;
    this.setState({
      fieldCrop,
      bed_config,
    });
  };

  onBedWidthChange = (e) => {
    e.target.value = e.target.value >= 0 ? e.target.value : 0;
    let bed_width = e.target.value;
    let { bed_config, fieldCrop } = this.state;
    fieldCrop.area_used = Number(bed_config.bed_length) * Number(bed_width) * Number(bed_config.bed_num);
    bed_config.bed_width = bed_width;
    this.setState({
      fieldCrop,
      bed_config,
    });
  };

  onBedNumChange = (e) => {
    e.target.value = e.target.value >= 0 ? e.target.value : 0;
    let bed_num = e.target.value;
    let { bed_config, fieldCrop } = this.state;
    fieldCrop.area_used = Number(bed_config.bed_length) * Number(bed_config.bed_width) * Number(bed_num);
    bed_config.bed_num = bed_num;
    this.setState({
      fieldCrop,
      bed_config,
    });
  };

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

  onStartDateChange = (date) => {
    const currentCrop = this.state.fieldCrop;
    currentCrop.start_date = date.format('YYYY-MM-DD');
    this.setState({ fieldCrop: currentCrop })
  };

  onEndDateChange = (date) => {
    const currentCrop = this.state.fieldCrop;
    currentCrop.end_date = date.format('YYYY-MM-DD');
    this.setState({ fieldCrop: currentCrop })
  };

  render() {
    const { isByArea, bed_config } = this.state;

    return (
      <div>
        <Button onClick={this.handleShow}>
          Edit
        </Button>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit - {this.props.cropBeingEdited.crop_common_name},
              Variety: {this.props.cropBeingEdited.variety}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <h4 style={{ textAlign: 'center' }}>Edit how much of the field you are using
                ({this.state.area_unit_label}&sup2;)</h4>
              {
                isByArea && <div>
                  <FormGroup>
                    <label>Percentage: </label>
                    <FormControl
                      data-test="percentage"
                      type="number"
                      min={0}
                      max={100}
                      placeholder={this.state.percentage}
                      onChange={(e) => this.handlePercentage(e)}/>
                  </FormGroup>
                  <FormGroup>
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
                !isByArea && bed_config && <div>
                  <FormGroup
                  >
                    <label>Bed Length: </label>
                    <FormControl
                      type="number"
                      value={bed_config.bed_length}
                      min={0}
                      onChange={(e) => this.onBedLenChange(e)}
                    />
                  </FormGroup>
                  <FormGroup
                  >
                    <label>Bed Width: </label>
                    <FormControl
                      type="number"
                      value={bed_config.bed_width}
                      min={0}
                      onChange={(e) => this.onBedWidthChange(e)}
                    />
                  </FormGroup>
                  <FormGroup
                  >
                    <label>Number of Beds: </label>
                    <FormControl
                      type="number"
                      value={bed_config.bed_num}
                      min={0}
                      onChange={(e) => this.onBedNumChange(e)}
                    />
                  </FormGroup>
                </div>
              }
              <FormGroup>
                <label>Area used in {this.state.area_unit_label}&sup2;: </label>
                <FormControl
                  type="number"
                  disabled={true}
                  value={this.state.fieldCrop.area_used}
                />
              </FormGroup>
              <h4 style={{ textAlign: 'center' }}>Edit start and finish dates</h4>
              <FormGroup controlId="start_date">
                <DateContainer date={moment(this.state.fieldCrop.start_date)} onDateChange={this.onStartDateChange}
                               placeholder="Choose a start date"/>
              </FormGroup>
              <FormGroup controlId="end_date">
                <DateContainer date={moment(this.state.fieldCrop.end_date)} onDateChange={this.onEndDateChange}
                               placeholder="Choose a end date"/>
              </FormGroup>
              <h4 style={{ textAlign: 'center' }}>Edit estimated price for the crop ($/{this.state.estimated_unit})</h4>
              <FormGroup controlId="estimated_price">
                <FormControl
                  type="number"
                  value={this.state.fieldCrop.estimated_price}
                  onChange={(e) => this.handleFieldCropPropertiesChange(e)}/>
              </FormGroup>
              {
                isByArea && <h4 style={{ textAlign: 'center' }}>Edit estimated yield for the crop
                  ({this.state.estimated_unit}/{this.state.area_unit_label}&sup2;)</h4>
              }
              {
                !isByArea && <h4 style={{ textAlign: 'center' }}>Edit estimated yield for the crop
                  ({this.state.estimated_unit}/bed)</h4>
              }
              <FormGroup controlId="estimated_yield">
                <FormControl
                  type="number"
                  value={this.state.fieldCrop.estimated_yield}
                  onChange={(e) => this.handleFieldCropPropertiesChange(e)}
                />
              </FormGroup>

            </FormGroup>


          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => {
              this.handleSubmitEditFieldCrop();
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
    farm: userFarmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(EditFieldCropModal);

