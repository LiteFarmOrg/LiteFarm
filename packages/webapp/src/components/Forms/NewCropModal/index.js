import React from 'react';
import {Button, Modal, FormGroup, FormControl, FormLabel, Form} from 'react-bootstrap';
import {CROP_GROUPS, DUMMY_NEW_CROP, INITIAL_STATE, CROP_DICT, NUTRIENT_DICT, NUTRIENT_ARRAY} from './constants';
import {connect} from 'react-redux';
import {toastr} from "react-redux-toastr";
import {createCropAction} from './actions';
import {getCrops} from '../../../containers/saga'
import styles from './styles.scss';
import Select from 'react-select';
import {crop_nutrient_data} from '../../../assets/data/crop_nutrient';
import {crop_physiology_data} from '../../../assets/data/crop_physiology';
import InfoBoxComponent from '../../../components/InfoBoxComponent';
import {roundToTwoDecimal}  from '../../../util';
import { cropsSelector } from '../../../containers/cropSlice';


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
      physiology_properties: ["initial_kc", "mid_kc", "end_kc", "max_height", "max_rooting_depth",],
      nutrient_credits: null,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      crops
    } = this.props;
    if(!(crops && crops.length))
    dispatch(getCrops());
  }

  handleClose() {
    this.setState(INITIAL_STATE);
  }

  handleShow() {
    this.setState({show: true});
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
    if (currentState.crop_group === '') {
      errors += 'Crop Group, ';
      validated = false;

    }
    if (currentState.crop_subgroup === '') {
      errors += 'Crop Subgroup, ';
      validated = false;
    }
    if (currentState.variety === '') {
      errors += 'Variety Name, ';
      validated = false;
    }


    if (!validated) {
      if (errors !== '') {
        toastr.error(errors + 'is not filled out')
      }
    }

    return validated
  }

  handleSaveNewCrop() {
    const {variety} = this.state;

    if (this.handleValidate()) {
      // currently sending dummy
      let newCrop = DUMMY_NEW_CROP;

      if (variety.trim() !== '') {
        newCrop.crop_common_name = this.state.crop_common_name + ' - ' + variety
      }
      else newCrop.crop_common_name = this.state.crop_common_name;

      newCrop.crop_genus = this.state.crop_genus;
      newCrop.crop_specie = this.state.crop_specie;
      newCrop.crop_group = this.state.crop_group;
      newCrop.crop_subgroup = this.state.crop_subgroup;

      for(let nutrient of NUTRIENT_ARRAY){
        newCrop[nutrient] = this.state[nutrient];
      }

      this.props.dispatch(createCropAction(newCrop)); // create field
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
    return 'error'
  };


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
      });

      for(let nutrient of NUTRIENT_ARRAY){
        this.setState({
          [nutrient]: Number(selected.value[nutrient])
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
      })
    }
  };

  expandNutrient = () =>{
    const {expand_nutrient} = this.state;
    this.setState({
      expand_nutrient: !expand_nutrient,
    })
  };

  loadDefaultCropData = (e) => {
    const {is_using_template} = this.state;
    const crop_subgroup = e.target.value;
    this.setState({
      crop_subgroup
    });

    if(is_using_template){
      for(let n of NUTRIENT_ARRAY){
        this.setState({
          [n]: Number(crop_nutrient_data[crop_subgroup][n])
        })
      }
      this.setState({
        initial_kc: crop_physiology_data[crop_subgroup]['initial_kc'],
        mid_kc: crop_physiology_data[crop_subgroup]['mid_kc'],
        end_kc: crop_physiology_data[crop_subgroup]['end_kc'],
        max_rooting_depth: crop_physiology_data[crop_subgroup]['max_rooting_depth'],
        depletion_fraction: crop_physiology_data[crop_subgroup]['depletion_fraction'],
        max_height: crop_physiology_data[crop_subgroup]['max_height'],
      })
    }
  };

  render() {
    let {subGroups, expand_nutrient, physiology_properties} = this.state;
    let {crops} = this.props;
    let cropOptions = [];
    if (crops && crops.length) {
      for (let c of crops) {
        cropOptions.push({
          value: c,
          label: c.crop_common_name,
        })
      }

      cropOptions.sort((a, b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));

      cropOptions.unshift({value: 'new', label: 'New'});
    }

    return (
      <div>
        {!this.props.isLink &&
        <Button style={{fillColor: '#7CCFA2', width: '100%'}} onClick={this.handleShow}>
          New Crop
        </Button>
        }
        {this.props.isLink &&
        <p>or <a onClick={this.handleShow} style={{textDecoration: 'underline'}}>Add New Crop or Variety</a></p>
        }

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>New Crop or Variety</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>Enter Crop Details</h4>
            <br/>

            <div className={styles.cropTemplate}>
              <h4>Select a crop template</h4>
              <Select options={cropOptions} onChange={(selectedOption) => this.handleCropChange(selectedOption)}/>
            </div>

            <FormLabel>Common Name, Species, and Genus</FormLabel>

            <FormGroup controlId="crop_common_name">
              <FormControl
                type="text"
                placeholder="Common Name"
                value={this.state.crop_common_name}
                onChange={(e) => {
                  this.setState({crop_common_name: e.target.value});
                }}/>
            </FormGroup>

            <FormGroup controlId="crop_variety"
            validationState={this.validateNotEmptyLength(this.state.variety)}
            >
              <FormControl
                type="text"
                placeholder="Variety Name"
                value={this.state.variety}
                onChange={(e) => {
                  this.setState({variety: e.target.value});
                }}
                />
            </FormGroup>

            <FormGroup controlId="crop_genus">
              <FormControl
                type="text"
                placeholder="Genus"
                value={this.state.crop_genus}
                onChange={(e) => {
                  this.setState({crop_genus: e.target.value});
                }}/>
            </FormGroup>
            <FormGroup controlId="crop_specie">
              <FormControl
                type="text"
                placeholder="Species"
                value={this.state.crop_specie}
                onChange={(e) => {
                  this.setState({crop_specie: e.target.value});
                }}/>
            </FormGroup>
            <FormLabel>Crop Group and Subgroup</FormLabel>
            <FormGroup controlId="crop_group">
              <Form.Control
                as="select"
                placeholder="Select crop group"
                value={this.state.crop_group}
                onChange={(e) =>
                  this.handleMatchCrop(e.target.value)
                }>
                <option key={"select crop group"} value={"select crop group"}>Select crop group</option>
                {CROP_GROUPS && CROP_GROUPS.map((cropGroup, cropGroupIndex) => (
                  <option key={cropGroupIndex} value={cropGroup}>{cropGroup}</option>
                ))}
              </Form.Control>
            </FormGroup>
            < FormGroup controlId="crop_subgroup">
              <Form.Control
                as="select"
                placeholder="Select crop subgroup"
                value={this.state.crop_subgroup}
                onChange={(e) =>
                  this.loadDefaultCropData(e)}>
                <option key={"select crop subgroup"} value={"select crop subgroup"}>Select crop subgroup</option>
                {subGroups && subGroups.map((cropSubGroup, cropSubGroupIndex) => (
                  <option key={cropSubGroupIndex} value={cropSubGroup}>{cropSubGroup}</option>
                ))}
              </Form.Control>
            </FormGroup>
            <div className={styles.cropGroupTitle}>
              <div onClick={()=>this.expandNutrient()} style={{marginBottom: '10px'}}>
                <a>Edit Crop Detail</a>
              </div>
              <InfoBoxComponent customStyle={{float: 'right', fontSize: '80%', marginTop: '0.2em'}} title={"Crop Group Info"}
                                body={'If you have information on the details of your crop or variety such as it’s nutrient content, ' +
                                'or physiological traits, you can edit them here.'}/>
            </div>
            {
              expand_nutrient && <div>
                <FormLabel>Physiology and Anatomy</FormLabel>
                <br/>
                <FormGroup controlId="crop_nutrient">
                  {
                    NUTRIENT_ARRAY.map((nutrient) => {

                      if(physiology_properties.includes(nutrient)) {
                        return <div key={nutrient}>
                          <p className={styles.nutrientLabel}>{NUTRIENT_DICT[nutrient]} {this.state[nutrient] === 0 && <p>{' ' + 'No Data'}</p>}</p>
                          <FormControl
                            className={styles.nutrientInput}
                            type="number"
                            placeholder={NUTRIENT_DICT[nutrient]}
                            value={Number(roundToTwoDecimal(this.state[nutrient]))}
                            onChange={(e) => {
                              this.setState({[nutrient]: Number(e.target.value)});
                            }}/>
                        </div>
                      }
                    })
                  }
                </FormGroup>

                <FormLabel>Nutrients in Edible Portion (per 100g)</FormLabel>
                <br/>
                <FormGroup controlId="crop_nutrient">
                  {
                    NUTRIENT_ARRAY.map((nutrient) => {

                      if(!physiology_properties.includes(nutrient)) {
                        return <div key={nutrient}>
                          <p className={styles.nutrientLabel}>{NUTRIENT_DICT[nutrient]}</p>
                          <FormControl
                            className={styles.nutrientInput}
                            type="number"
                            placeholder={NUTRIENT_DICT[nutrient]}
                            value={Number(roundToTwoDecimal(this.state[nutrient]))}
                            onChange={(e) => {
                              this.setState({[nutrient]: Number(e.target.value)});
                            }}/>
                        </div>
                      }
                    })
                  }
                </FormGroup>
              </div>
            }

          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => {
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
    crops: cropsSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(NewCropModal);
