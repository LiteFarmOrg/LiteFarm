import React, { Component } from 'react';
import Script from 'react-load-script';
import { actions, Control } from "react-redux-form";
import { toastr } from 'react-redux-toastr';
import { connect } from "react-redux";

class FarmAddress extends Component {
  selectedAddressName = '';
  constructor(props) {
    super(props);
    this.handleScriptLoad = this.handleScriptLoad.bind(this);
    this.handlePlaceChanged = this.handlePlaceChanged.bind(this);
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
    this.autocomplete.addListener('place_changed', this.handlePlaceChanged);
  }

  handleBlur() {
    return () => {
      const gridPoints = {};
      let model = this.props.model;
      if (!model) {
        model = ".farm"
      }
      const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
      const isCoord = coordRegex.test(this.props.address);
      if (isCoord) {
        // convert input to array of numbers
        let coords = this.props.address.split(',');
        coords = coords.map(str => parseFloat(str));
        // perform check on lat lng values
        let lat = coords[0];
        let lng = coords[1];
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          this.clearModel(model);
          toastr.error(`Received invalid latitude or longitude value`);
          return;
        }
        
        this.props.dispatch(actions.change('profileForms' + model + '.address', this.props.address));
        gridPoints['lat'] = lat;
        gridPoints['lng'] = lng;
        this.props.dispatch(actions.change('profileForms' + model + '.gridPoints', gridPoints));
      } else {
        const place = this.autocomplete.getPlace();
        if(!place || !place.geometry || this.props.address !== this.selectedAddressName) {
          this.clearModel(model);
        }
      }
    }
  }

  handlePlaceChanged() {
    const gridPoints = {};
    let model = this.props.model;
    const place = this.autocomplete.getPlace();
    const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const isCoord = coordRegex.test(this.props.address);
    if (!model) {
      model = ".farm"
    }
    if(!place.geometry && !isCoord) {
      this.clearModel(model)
      return;
    }
    if(isCoord){
      return;
    }
    this.props.dispatch(actions.change('profileForms' + model + '.address', place.formatted_address));
    this.selectedAddressName = place.formatted_address;
    gridPoints['lat'] = place.geometry.location.lat();
    gridPoints['lng'] = place.geometry.location.lng();
    this.props.dispatch(actions.change('profileForms' + model + '.gridPoints', gridPoints));
  }

  clearModel(model) {
    this.props.dispatch(actions.change('profileForms' + model + '.address', ''));
    this.props.dispatch(actions.change('profileForms' + model + '.gridPoints', { }));
  }

  render() {
    let { model, defaultValue } = this.props;
    if (!model) {
      model = ".farm"
    }
    if (!defaultValue) {
      defaultValue = ''
    }
    return (
      <div>
        <Script
          url={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry`}
          onLoad={this.handleScriptLoad}
        />
        <Control.text defaultValue={defaultValue} style={{ width: '250px' }} id="autocomplete"
                      model={model + '.address'} validators={{
          required: (val) => val && val.length,
          length: (val) => val && val.length > 2
        }} onBlur={this.handleBlur()}/>
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
