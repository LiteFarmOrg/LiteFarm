import React from 'react';
import { Button, Modal, FormGroup, FormControl, FormLabel, Form } from 'react-bootstrap';
import {
  CROP_GROUPS,
  DUMMY_NEW_CROP,
  INITIAL_STATE,
  CROP_DICT,
  NUTRIENT_DICT,
  NUTRIENT_ARRAY,
} from './constants';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { postCrop } from './saga';
import { getCrops } from '../../../containers/saga';
import styles from './styles.scss';
import Select from 'react-select';
import { crop_nutrient_data } from '../../../assets/data/crop_nutrient';
import { crop_physiology_data } from '../../../assets/data/crop_physiology';
import InfoBoxComponent from '../../../components/InfoBoxComponent';
import { roundToTwoDecimal } from '../../../util';
import { cropsSelector, cropStatusSelector } from '../../../containers/cropSlice';
import { withTranslation } from 'react-i18next';
import { numberOnKeyDown } from '../../Form/Input';

class NewCropModal extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSaveNewCrop = this.handleSaveNewCrop.bind(this);
    this.handleMatchCrop = this.handleMatchCrop.bind(this);
    this.handleValidate = this.handleValidate.bind(this);

    this.state = {
      show: false,
      crop_common_name: '',
      crop_genus: '',
      crop_specie: '',
      crop_group: '',
      crop_subgroup: '',
      max_rooting_depth: null,
      depletion_fraction: null,
      percentrefuse: null,
      refuse: null,
      is_avg_depth: null,
      initial_kc: null,
      mid_kc: null,
      end_kc: null,
      max_height: null,
      is_avg_kc: null,
      protein: null,
      lipid: null,
      energy: null,
      ca: null,
      fe: null,
      mg: null,
      ph: null,
      k: null,
      na: null,
      zn: null,
      cu: null,
      fl: null,
      mn: null,
      se: null,
      vita_rae: null,
      vite: null,
      vitc: null,
      thiamin: null,
      riboflavin: null,
      niacin: null,
      pantothenic: null,
      vitb6: null,
      vitk: null,
      folate: null,
      vitb12: null,
      is_avg_nutrient: null,
      nutrient_notes: '',
      same_crop_group: [],
      same_subgroup: [],
      avg_crop: {},
      subGroups: [],
      variety: '',
      expand_nutrient: false,
      is_using_template: true,
      physiology_properties: ['initial_kc', 'mid_kc', 'end_kc', 'max_height', 'max_rooting_depth'],
      nutrient_credits: null,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(getCrops());
  }

  handleClose() {
    this.setState(INITIAL_STATE);
  }

  handleShow() {
    this.setState({ show: true });
  }

  handleValidate() {
    const currentState = this.state;
    let validated = true;
    let errors = '';
    if (currentState.crop_common_name === '') {
      errors += 'Crop Common Name, ';
      validated = false;
    }
    if (currentState.crop_genus === '') {
      errors += 'Crop Genus, ';
      validated = false;
    }
    if (currentState.crop_specie === '') {
      errors += 'Crop Species, ';
      validated = false;
    }
    // if (currentState.crop_group === '') {
    //   errors += 'Crop Group, ';
    //   validated = false;
    // }
    // if (currentState.crop_subgroup === '') {
    //   errors += 'Crop Subgroup, ';
    //   validated = false;
    // }
    if (currentState.variety === '') {
      errors += 'Variety Name, ';
      validated = false;
    }

    if (!validated) {
      if (errors !== '') {
        toastr.error(errors + this.props.t('message:NEW_FIELD_CROP.ERROR.NOT_FILLED'));
      }
    }

    return validated;
  }

  handleSaveNewCrop() {
    const { variety } = this.state;

    if (this.handleValidate()) {
      // currently sending dummy
      let newCrop = DUMMY_NEW_CROP;
      const crop_common_name = this.state.crop_translation_key
        ? this.props.t(`crop:${this.state.crop_translation_key}`)
        : this.state.crop_common_name;
      if (variety.trim() !== '') {
        newCrop.crop_common_name = crop_common_name + ' - ' + variety;
      } else newCrop.crop_common_name = crop_common_name;

      newCrop.crop_genus = this.state.crop_genus;
      newCrop.crop_specie = this.state.crop_specie;
      newCrop.crop_group = this.state.crop_group || 'Other crops';
      newCrop.crop_subgroup = this.state.crop_subgroup || 'Other crops';

      for (let nutrient of NUTRIENT_ARRAY) {
        newCrop[nutrient] = this.state[nutrient] ?? 0;
      }

      this.props.dispatch(postCrop(newCrop)); // create field
      this.handleClose();
    }
  }

  handleMatchCrop(matchGroup) {
    let subGroups = CROP_DICT[matchGroup];

    this.setState({
      crop_group: matchGroup,
      subGroups,
    });
  }

  validateNotEmptyLength(state) {
    if (state.length > 0) return 'success';
    return 'error';
  }

  handleCropChange = (selected) => {
    if (selected.value !== 'new') {
      this.handleMatchCrop(selected.value.crop_group);

      this.setState({
        crop_common_name: selected.value.crop_common_name,
        crop_genus: selected.value.crop_genus,
        crop_specie: selected.value.crop_specie,
        crop_group: selected.value.crop_group,
        crop_subgroup: selected.value.crop_subgroup,
        max_rooting_depth: selected.value.max_rooting_depth,
        depletion_fraction: selected.value.depletion_fraction,
        percentrefuse: selected.value.percentrefuse,
        refuse: selected.value.refuse,
        is_avg_depth: null,
        is_avg_kc: null,
        is_avg_nutrient: null,
        is_using_template: false,
        crop_translation_key: selected.value.crop_translation_key,
      });

      for (let nutrient of NUTRIENT_ARRAY) {
        this.setState({
          [nutrient]: Number(selected.value[nutrient]),
        });
      }
    } else {
      this.setState({
        crop_common_name: '',
        crop_genus: '',
        crop_specie: '',
        crop_group: '',
        crop_subgroup: '',
        max_rooting_depth: null,
        depletion_fraction: null,
        percentrefuse: null,
        refuse: null,
        is_avg_depth: null,
        initial_kc: null,
        mid_kc: null,
        end_kc: null,
        max_height: null,
        is_avg_kc: null,
        protein: null,
        lipid: null,
        energy: null,
        ca: null,
        fe: null,
        mg: null,
        ph: null,
        k: null,
        na: null,
        zn: null,
        cu: null,
        fl: null,
        mn: null,
        se: null,
        vita_rae: null,
        vite: null,
        vitc: null,
        thiamin: null,
        riboflavin: null,
        niacin: null,
        pantothenic: null,
        vitb6: null,
        vitk: null,
        folate: null,
        vitb12: null,
        is_avg_nutrient: null,
        is_using_template: true,
        nutrient_credits: null,
      });
    }
  };

  expandNutrient = () => {
    const { expand_nutrient } = this.state;
    this.setState({
      expand_nutrient: !expand_nutrient,
    });
  };

  loadDefaultCropData = (e) => {
    const { is_using_template } = this.state;
    const crop_subgroup = e.target.value;
    this.setState({
      crop_subgroup,
    });

    if (is_using_template) {
      for (let n of NUTRIENT_ARRAY) {
        this.setState({
          [n]: Number(crop_nutrient_data[crop_subgroup][n]),
        });
      }
      this.setState({
        initial_kc: crop_physiology_data[crop_subgroup]['initial_kc'],
        mid_kc: crop_physiology_data[crop_subgroup]['mid_kc'],
        end_kc: crop_physiology_data[crop_subgroup]['end_kc'],
        max_rooting_depth: crop_physiology_data[crop_subgroup]['max_rooting_depth'],
        depletion_fraction: crop_physiology_data[crop_subgroup]['depletion_fraction'],
        max_height: crop_physiology_data[crop_subgroup]['max_height'],
      });
    }
  };

  render() {
    let { subGroups, expand_nutrient, physiology_properties } = this.state;
    let { crops } = this.props;
    let cropOptions = [];
    if (crops && crops.length) {
      for (let c of crops) {
        cropOptions.push({
          value: c,
          label: this.props.t(`crop:${c.crop_translation_key}`),
        });
      }

      cropOptions.sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

      cropOptions.unshift({ value: 'new', label: this.props.t('FIELDS.EDIT_FIELD.CROP.NEW_CROP') });
    }

    return (
      <div>
        {!this.props.isLink && (
          <Button style={{ fillColor: '#7CCFA2', width: '100%' }} onClick={this.handleShow}>
            {this.props.t('FIELDS.EDIT_FIELD.CROP.NEW_CROP')}
          </Button>
        )}
        {this.props.isLink && (
          <p>
            {this.props.t('common:OR')}{' '}
            <a onClick={this.handleShow} style={{ textDecoration: 'underline' }}>
              {this.props.t('FIELDS.EDIT_FIELD.CROP.ADD_NEW_CROP_OR_VARIETY')}
            </a>
          </p>
        )}

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.t('FIELDS.EDIT_FIELD.CROP.NEW_CROP_VARIETY')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>{this.props.t('FIELDS.EDIT_FIELD.CROP.ENTER_CROP_DETAILS')}</h4>
            <br />

            <div className={styles.cropTemplate}>
              <h4>{this.props.t('FIELDS.EDIT_FIELD.CROP.SELECT_CROP_TEMPLATE')}</h4>
              <Select
                options={cropOptions}
                onChange={(selectedOption) => this.handleCropChange(selectedOption)}
              />
            </div>

            <FormGroup controlId="crop_common_name">
              <FormControl
                type="text"
                placeholder={this.props.t('FIELDS.EDIT_FIELD.CROP.CROP_COMMON_NAME')}
                value={this.state.crop_common_name}
                onChange={(e) => {
                  this.setState({ crop_common_name: e.target.value });
                }}
              />
            </FormGroup>

            <FormGroup
              controlId="crop_variety"
              validationState={this.validateNotEmptyLength(this.state.variety)}
            >
              <FormControl
                type="text"
                placeholder={this.props.t('FIELDS.EDIT_FIELD.CROP.VARIETY_NAME')}
                value={this.state.variety}
                onChange={(e) => {
                  this.setState({ variety: e.target.value });
                }}
              />
            </FormGroup>

            <FormGroup controlId="crop_genus">
              <FormControl
                type="text"
                placeholder={this.props.t('FIELDS.EDIT_FIELD.CROP.GENUS')}
                value={this.state.crop_genus}
                onChange={(e) => {
                  this.setState({ crop_genus: e.target.value });
                }}
              />
            </FormGroup>
            <FormGroup controlId="crop_specie">
              <FormControl
                type="text"
                placeholder={this.props.t('FIELDS.EDIT_FIELD.CROP.SPECIES')}
                value={this.state.crop_specie}
                onChange={(e) => {
                  this.setState({ crop_specie: e.target.value });
                }}
              />
            </FormGroup>
            <span style={{ display: 'none' }}>
              <FormLabel>{this.props.t('FIELDS.EDIT_FIELD.CROP.CROP_GROUP_SUBGROUP')}</FormLabel>
              <FormGroup controlId="crop_group">
                <Form.Control
                  as="select"
                  placeholder={this.props.t('FIELDS.EDIT_FIELD.CROP.SELECT_CROP_GROUP')}
                  value={this.state.crop_group}
                  onChange={(e) => this.handleMatchCrop(e.target.value)}
                >
                  <option key={'select crop group'} value={'select crop group'}>
                    {this.props.t('FIELDS.EDIT_FIELD.CROP.SELECT_CROP_GROUP')}
                  </option>
                  {CROP_GROUPS &&
                    CROP_GROUPS.map((cropGroup, cropGroupIndex) => (
                      <option key={cropGroupIndex} value={cropGroup}>
                        {cropGroup}
                      </option>
                    ))}
                </Form.Control>
              </FormGroup>
              <FormGroup controlId="crop_subgroup">
                <Form.Control
                  as="select"
                  placeholder={this.props.t('FIELDS.EDIT_FIELD.CROP.SELECT_CROP_SUBGROUP')}
                  value={this.state.crop_subgroup}
                  onChange={(e) => this.loadDefaultCropData(e)}
                >
                  <option key={'select crop subgroup'} value={'select crop subgroup'}>
                    Select crop subgroup
                  </option>
                  {subGroups &&
                    subGroups.map((cropSubGroup, cropSubGroupIndex) => (
                      <option key={cropSubGroupIndex} value={cropSubGroup}>
                        {cropSubGroup}
                      </option>
                    ))}
                </Form.Control>
              </FormGroup>
            </span>
            <div className={styles.cropGroupTitle}>
              <div onClick={() => this.expandNutrient()} style={{ marginBottom: '10px', order: 0 }}>
                <a>{this.props.t('FIELDS.EDIT_FIELD.CROP.EDIT_CROP_DETAIL')}</a>
              </div>
              <div style={{ order: 1, paddingRight: '40px' }}>
                <InfoBoxComponent
                  customStyle={{
                    float: 'right',
                    fontSize: '80%',
                    marginTop: '0.2em',
                  }}
                  title={this.props.t('FIELDS.EDIT_FIELD.CROP.CROP_GROUP_INFO')}
                  body={this.props.t('FIELDS.EDIT_FIELD.CROP.NEW_CROP_INFOBOX')}
                />
              </div>
            </div>
            {expand_nutrient && (
              <div>
                <FormLabel>Physiology and Anatomy</FormLabel>
                <br />
                <FormGroup controlId="crop_nutrient">
                  {NUTRIENT_ARRAY.map((nutrient) => {
                    if (physiology_properties.includes(nutrient)) {
                      return (
                        <div key={nutrient}>
                          <p className={styles.nutrientLabel}>
                            {this.props.t(NUTRIENT_DICT[nutrient])}{' '}
                            {this.state[nutrient] === 0 && (
                              <p>{' ' + this.props.t('FIELDS.EDIT_FIELD.CROP.NO_DATA')}</p>
                            )}
                          </p>
                          <FormControl
                            className={styles.nutrientInput}
                            type="number"
                            onKeyDown={numberOnKeyDown}
                            placeholder={this.props.t(NUTRIENT_DICT[nutrient])}
                            value={Number(roundToTwoDecimal(this.state[nutrient]))}
                            onChange={(e) => {
                              this.setState({
                                [nutrient]: Number(e.target.value),
                              });
                            }}
                          />
                        </div>
                      );
                    }
                  })}
                </FormGroup>

                <FormLabel>{this.props.t('FIELDS.EDIT_FIELD.CROP.NUTRIENT_LABEL')}</FormLabel>
                <br />
                <FormGroup controlId="crop_nutrient">
                  {NUTRIENT_ARRAY.map((nutrient) => {
                    if (!physiology_properties.includes(nutrient)) {
                      return (
                        <div key={nutrient}>
                          <p className={styles.nutrientLabel}>
                            {this.props.t(NUTRIENT_DICT[nutrient])}
                          </p>
                          <FormControl
                            className={styles.nutrientInput}
                            type="number"
                            onKeyDown={numberOnKeyDown}
                            placeholder={this.props.t(NUTRIENT_DICT[nutrient])}
                            value={Number(roundToTwoDecimal(this.state[nutrient]))}
                            onChange={(e) => {
                              this.setState({
                                [nutrient]: Number(e.target.value),
                              });
                            }}
                          />
                        </div>
                      );
                    }
                  })}
                </FormGroup>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                this.handleSaveNewCrop();
                this.props.handler();
              }}
            >
              {this.props.t('common:SAVE')}
            </Button>
            <Button onClick={this.handleClose}>{this.props.t('common:CLOSE')}</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropsSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(NewCropModal));
