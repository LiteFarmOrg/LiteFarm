import React from 'react';
import { FormControl, FormGroup } from 'react-bootstrap';
import { Dialog } from '@material-ui/core';
import Button from '../../Form/Button';
import { connect } from 'react-redux';
import { cropsSelector } from '../../../containers/cropSlice';
import { getCrops } from '../../../containers/saga';
import { FIELD_CROPS_INIT } from '../../../containers/Field/constants';
import NewCropModal from '../NewCropModal';
import styles from '../../../containers/Field/styles.module.scss';
import newFieldStyles from './styles.module.scss';
import { convertFromMetric, convertToMetric, getUnit, roundToTwoDecimal } from '../../../util';
import DateContainer from '../../../components/Inputs/DateContainer';
import { toastr } from 'react-redux-toastr';
import moment from 'moment';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import { withTranslation } from 'react-i18next';
import {
  createPrice,
  createYield,
  postFieldCrop,
} from '../../../containers/LocationDetails/LocationFieldCrop/saga';
import { numberOnKeyDown } from '../../Form/Input';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';
import { Label, Semibold, Underlined } from '../../Typography';
import { cropLocationEntitiesSelector } from '../../../containers/locationSlice';
import ReactSelect from '../../Form/ReactSelect';

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
      this.setState((preState) => ({
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
      let { total_area: fieldArea } = this.props.cropLocationEntities[this.props.location_id];
      newFieldCrop.area_used =
        newFieldCrop.area_used > fieldArea ? fieldArea : newFieldCrop.area_used;
      let estimatedProduction = isByArea
        ? newFieldCrop.estimated_yield * newFieldCrop.area_used
        : newFieldCrop.estimated_yield * bed_num;
      let estimatedRevenue = isByArea
        ? estimatedProduction * newFieldCrop.estimated_price
        : bed_num * newFieldCrop.estimated_price * newFieldCrop.estimated_yield;

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

      this.props.dispatch(createYield(yieldData));
      this.props.dispatch(createPrice(priceData));

      let bed_config = null;
      if (!isByArea) {
        bed_config = {
          bed_length,
          bed_width,
          bed_num,
        };
      }
      this.props.dispatch(
        postFieldCrop({
          crop_id: newFieldCrop.crop_id,
          location_id: this.props.location_id,
          start_date: newFieldCrop.start_date,
          end_date: newFieldCrop.end_date,
          area_used: convertToMetric(newFieldCrop.area_used, area_unit, 'm2'),
          estimated_production: estimatedProduction,
          estimated_revenue: estimatedRevenue,
          is_by_bed: !isByArea,
          bed_config: bed_config,
        }),
      );
      this.setState({ show: false });
      this.setState({ fieldCrop: FIELD_CROPS_INIT });
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
    return 'error';
  }

  validateWarningEmptyLength(state) {
    if (state.length > 0) return 'success';
    return 'warning';
  }

  validateHasDate(date) {
    if (date) return 'success';
    else return 'error';
  }

  validateForm() {
    const currentFieldCrop = this.state.fieldCrop;

    let { total_area: fieldArea } = this.props.cropLocationEntities[this.props.location_id];

    if (this.state.area_unit === 'ft2') {
      fieldArea = roundToTwoDecimal(convertFromMetric(fieldArea, this.state.area_unit, 'm2'));
    }

    let isValid = true;
    let errors = '';

    if (moment(currentFieldCrop.end_date).isSameOrBefore(moment(currentFieldCrop.start_date))) {
      toastr.error(this.props.t('message:EDIT_FIELD_CROP.ERROR.END_DATE_BEFORE'));
      isValid = false;
      return isValid;
    }

    for (const key in currentFieldCrop) {
      if (currentFieldCrop[key] === '') {
        isValid = false;
        errors += key + ', ';
      }
    }

    if (!isValid) {
      toastr.error(errors + this.props.t('message:NEW_FIELD_CROP.ERROR.NOT_FILLED'));
    } else {
      toastr.success(this.props.t('message:NEW_FIELD_CROP.SUCCESS.SAVE'));
    }

    return isValid;
  }

  handlePercentage = (e) => {
    let { fieldCrop } = this.state;
    if (e.target.value < 0) {
      e.target.value = 0;
    }

    if (e.target.value > 100) {
      e.target.value = 100;
    }

    let { total_area: fieldArea } = this.props.cropLocationEntities[this.props.location_id];

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
    this.setState({ fieldCrop: currentCrop });
  };

  onEndDateChange = (date) => {
    const currentCrop = this.state.fieldCrop;
    currentCrop.end_date = date;
    this.setState({ fieldCrop: currentCrop });
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
          label: this.props.t(`crop:${c.crop_translation_key}`),
        });
      }
      cropOptions.sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));
    }
    return cropOptions;
  };

  render() {
    let { total_area: fieldArea } = this.props.cropLocationEntities[this.props.location_id];
    let { isByArea, clicked, un_clicked, area_unit_label } = this.state;

    fieldArea = roundToTwoDecimal(convertFromMetric(fieldArea, this.state.area_unit, 'm2'));
    return (
      <div>
        <div
          style={{
            marginBottom: '20px',
            width: 'fit-content',
            fontSize: '16px',
            color: 'var(--iconActive)',
            lineHeight: '16px',
            cursor: 'pointer',
          }}
          onClick={this.handleShow}
        >
          + <Underlined>{this.props.t('LOCATION_CROPS.ADD_NEW')}</Underlined>
        </div>

        <Dialog
          PaperProps={{ className: newFieldStyles.dialogContainer }}
          fullWidth={true}
          maxWidth={'sm'}
          open={this.state.show}
          onClose={this.handleClose}
          scroll={'body'}
        >
          <div>
            <Semibold>{this.props.t('FIELDS.EDIT_FIELD.CROP.NEW_FIELD_CROP')}</Semibold>

            <FormGroup>
              <FormGroup
                validationState={this.validateNotEmptyLength(this.state.fieldCrop.crop_id)}
                controlId="crop_id"
              >
                <ReactSelect
                  label={this.props.t('LOG_HARVEST.CROP')}
                  options={this.getCropOptions()}
                  value={
                    this.state.crop_option.crop_id && {
                      value: this.state.crop_option,
                      label: this.props.t(`crop:${this.state.crop_option.crop_translation_key}`),
                    }
                  }
                  onChange={(selectedOption) => this.handleCropSelect(selectedOption)}
                  placeholder={this.props.t('FIELDS.EDIT_FIELD.SELECT')}
                  required
                />
              </FormGroup>

              <NewCropModal handler={this.handleSaveCustomCrop} isLink={true} />

              <h4 style={{ textAlign: 'center' }}>
                {this.props.t('FIELDS.EDIT_FIELD.CROP.HOW_MUCH_FIELD')}
              </h4>
              <div className={styles.areaBtnContainer}>
                <button
                  style={isByArea ? clicked : un_clicked}
                  onClick={() => this.toggleAreaBed(true)}
                >
                  {this.props.t('FIELDS.EDIT_FIELD.CROP.BY_AREA')}
                </button>
                <button
                  style={isByArea ? un_clicked : clicked}
                  onClick={() => this.toggleAreaBed(false)}
                >
                  {this.props.t('FIELDS.EDIT_FIELD.CROP.BY_BEDS')}
                </button>
              </div>
              <div>
                <h5 style={{ textAlign: 'right' }}>
                  {this.props.t('FIELDS.EDIT_FIELD.CROP.FIELD_SIZE')}: {fieldArea}{' '}
                  {this.state.area_unit_label}&sup2;
                </h5>
              </div>
              <div className={styles.container}>
                {isByArea && (
                  <div>
                    <FormGroup
                      validationState={this.validateNotEmptyLength(this.state.fieldCrop.area_used)}
                      className={newFieldStyles.areaContainer}
                    >
                      <Label>{this.props.t('FIELDS.EDIT_FIELD.CROP.PERCENTAGE')}: </Label>
                      <FormControl
                        type="number"
                        onKeyDown={numberOnKeyDown}
                        placeholder="0"
                        min={0}
                        max={100}
                        onChange={(e) => this.handlePercentage(e)}
                      />
                    </FormGroup>
                    <FormGroup className={newFieldStyles.areaContainer}>
                      <label>{this.props.t('FIELDS.EDIT_FIELD.CROP.AREA_USED_HECTARE')}: </label>
                      <FormControl
                        type="number"
                        onKeyDown={numberOnKeyDown}
                        placeholder="0"
                        disabled={true}
                        value={(this.state.fieldCrop.area_used / 10000).toFixed(2)}
                      />
                    </FormGroup>
                  </div>
                )}
                {!isByArea && (
                  <div>
                    <FormGroup
                      validationState={this.validateNotEmptyLength(this.state.bed_length)}
                      className={newFieldStyles.areaContainer}
                    >
                      <label>
                        {this.props.t('FIELDS.EDIT_FIELD.CROP.BED_LENGTH')}: ({area_unit_label})
                      </label>
                      <FormControl
                        type="number"
                        onKeyDown={numberOnKeyDown}
                        placeholder={'0'}
                        min={0}
                        onChange={(e) => this.onBedLenChange(e)}
                      />
                    </FormGroup>
                    <FormGroup
                      validationState={this.validateNotEmptyLength(this.state.bed_width)}
                      className={newFieldStyles.areaContainer}
                    >
                      <label>
                        {this.props.t('FIELDS.EDIT_FIELD.CROP.BED_WIDTH')}: ({area_unit_label})
                      </label>
                      <FormControl
                        type="number"
                        onKeyDown={numberOnKeyDown}
                        placeholder={'0'}
                        min={0}
                        onChange={(e) => this.onBedWidthChange(e)}
                      />
                    </FormGroup>
                    <FormGroup
                      validationState={this.validateNotEmptyLength(this.state.bed_num)}
                      className={newFieldStyles.areaContainer}
                    >
                      <label>{this.props.t('FIELDS.EDIT_FIELD.CROP.NUMBER_OF_BEDS')}: </label>
                      <FormControl
                        type="number"
                        onKeyDown={numberOnKeyDown}
                        value={this.state.bed_num}
                        min={0}
                        onChange={(e) => this.onBedNumChange(e)}
                      />
                    </FormGroup>
                  </div>
                )}
                <FormGroup className={newFieldStyles.areaContainer}>
                  <label>
                    {this.props.t('FIELDS.EDIT_FIELD.CROP.AREA_USED_IN')}{' '}
                    {this.state.area_unit_label}
                    &sup2;:{' '}
                  </label>
                  <FormControl
                    type="number"
                    onKeyDown={numberOnKeyDown}
                    disabled={true}
                    value={this.state.fieldCrop.area_used}
                  />
                </FormGroup>

                <h4 style={{ textAlign: 'center' }}>
                  {this.props.t('FIELDS.EDIT_FIELD.CROP.ENTER_START_FINISH')}
                </h4>
                <FormGroup
                  controlId="start_date"
                  validationState={this.validateHasDate(this.state.fieldCrop.start_date)}
                >
                  <DateContainer
                    date={this.state.fieldCrop.start_date}
                    onDateChange={this.onStartDateChange}
                    placeholder={this.props.t('FIELDS.EDIT_FIELD.CROP.CHOOSE_START_DATE')}
                  />
                </FormGroup>
                <FormGroup
                  controlId="end_date"
                  validationState={this.validateHasDate(this.state.fieldCrop.end_date)}
                >
                  <DateContainer
                    date={this.state.fieldCrop.end_date}
                    onDateChange={this.onEndDateChange}
                    placeholder={this.props.t('FIELDS.EDIT_FIELD.CROP.CHOOSE_END_DATE')}
                  />
                </FormGroup>
                <div>
                  <h4 style={{ textAlign: 'center' }}>
                    {this.props.t('FIELDS.EDIT_FIELD.CROP.EDIT_ESTIMATED_PRICE')}(
                    {this.state.currencySymbol}/{this.state.estimated_unit})
                  </h4>
                  <FormGroup
                    validationState={this.validateNotEmptyLength(
                      this.state.fieldCrop.estimated_price,
                    )}
                    controlId="estimated_price"
                  >
                    <FormControl
                      type="number"
                      onKeyDown={numberOnKeyDown}
                      placeholder={`${this.props.t('FIELDS.EDIT_FIELD.CROP.ESTIMATED_PRICE')} (${
                        this.state.currencySymbol
                      }/${this.state.estimated_unit})`}
                      value={this.state.fieldCrop.estimated_price}
                      onChange={(e) => this.handleFieldCropPropertiesChange(e)}
                    />
                  </FormGroup>
                </div>
                <div>
                  {isByArea && (
                    <h4 style={{ textAlign: 'center' }}>
                      {this.props.t('FIELDS.EDIT_FIELD.CROP.EDIT_ESTIMATED_YIELD')}(
                      {this.state.estimated_unit}/{this.state.area_unit_label}
                      &sup2;)
                    </h4>
                  )}
                  {!isByArea && (
                    <h4 style={{ textAlign: 'center' }}>
                      {this.props.t('FIELDS.EDIT_FIELD.CROP.EDIT_ESTIMATED_YIELD')}(
                      {this.state.estimated_unit}/{this.props.t('FIELDS.EDIT_FIELD.CROP.BED')})
                    </h4>
                  )}

                  <FormGroup
                    controlId="estimated_yield"
                    validationState={this.validateNotEmptyLength(
                      this.state.fieldCrop.estimated_yield,
                    )}
                  >
                    <FormControl
                      type="number"
                      onKeyDown={numberOnKeyDown}
                      placeholder={this.props.t(
                        'FIELDS.EDIT_FIELD.CROP.ESTIMATED_YIELD_PLACEHOLDER',
                      )}
                      value={this.state.fieldCrop.estimated_yield}
                      onChange={(e) => this.handleFieldCropPropertiesChange(e)}
                    />
                  </FormGroup>
                </div>
              </div>
            </FormGroup>

            <div style={{ display: 'inline-flex', gap: ' 8px', marginTop: '16px', width: '100%' }}>
              <Button fullLength color={'secondary'} sm onClick={this.handleClose}>
                {this.props.t('common:CLOSE')}
              </Button>
              <Button
                sm
                fullLength
                onClick={() => {
                  this.handleSaveNewCrop();
                  this.props.handler();
                }}
              >
                {this.props.t('common:SAVE')}
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropsSelector(state),
    farm: userFarmSelector(state),
    cropLocationEntities: cropLocationEntitiesSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(NewFieldCropModal));
