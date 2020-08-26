import React, {Component} from 'react';
import Script from 'react-load-script';
import {actions, Control} from "react-redux-form";
import { toastr } from 'react-redux-toastr';
import {connect} from "react-redux";

class FarmAddress extends Component {
  constructor(props) {
    super(props);
    this.handleScriptLoad = this.handleScriptLoad.bind(this);
    this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
  }

  handleScriptLoad() {
    const options = {
      types: ['address']
    };

    // Initialize Google Autocomplete
    /*global google*/ // To disable any eslint 'google not defined' errors
    this.autocomplete = new google.maps.places.Autocomplete(
      document.getElementById('autocomplete'),
      options,
    );

    // Avoid paying for data that you don't need by restricting the set of
    // place fields that are returned to just the address components and formatted
    // address.
    this.autocomplete.setFields(['geometry', 'formatted_address']);

    // Fire Event when a suggested name is selected
    this.autocomplete.addListener('place_changed', this.handlePlaceSelect(false));
  }
  handlePlaceSelect() {
    return (blurring) => {
      const place = this.autocomplete.getPlace();
      const gridPoints = {};
      let model = this.props.model;
      if(!model) {
        model = ".farm"
      }
      if(blurring && Object.keys(this.props.points).length === 0 && !place) {
        this.props.dispatch(actions.change('profileForms' + model + '.address', ''));
        return;
      }
      if(!place.geometry && !blurring) {
        this.props.dispatch(actions.change('profileForms' + model + '.address', ''));
        return toastr.error(`No location information found for ${place.name}`)
      }
      if(blurring) {
        return;
      }
      this.props.dispatch(actions.change('profileForms' + model + '.address', place.formatted_address));
      gridPoints['lat'] = place.geometry.location.lat();
      gridPoints['lng'] = place.geometry.location.lng();
      this.props.dispatch(actions.change('profileForms' + model + '.gridPoints', gridPoints));
    }
  }

  render() {
    let {model, defaultValue} = this.props;
    if(!model) {
      model = ".farm"
    }
    if(!defaultValue) {
      defaultValue = ''
    }
    return (
    <div>
      <Script
        url={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry`}
        onLoad={this.handleScriptLoad}
      />
      <Control.text defaultValue={defaultValue} style={{width: '250px'}} id="autocomplete" model={model + '.address'} validators={{
        required: (val) => val && val.length,
        length: (val) => val && val.length > 2
      }} onBlur={this.handlePlaceSelect(true)} />
    </div>)
  }

}
const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

const mapStateToProps = (state) => ({
    points: state.profileForms.farm.gridPoints,
    address: state.profileForms.farm.address
})

export default connect(mapStateToProps, mapDispatchToProps)(FarmAddress);
