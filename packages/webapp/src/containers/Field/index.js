/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import { connect } from 'react-redux';
import styles from './styles.scss';
import { Button, Tab, Table, Tabs } from 'react-bootstrap';
import { cropSelector as fieldCropSelector, fieldSelector } from '../selector';
import history from '../../history';
import moment from 'moment';
import { getFields } from '../actions';
import { CENTER, DEFAULT_ZOOM, FARM_BOUNDS, GMAPS_API_KEY, TREE_ICON } from './constants';
import { convertFromMetric, getUnit, roundToTwoDecimal } from '../../util';
import { BsChevronDown, BsChevronRight } from 'react-icons/all';
import { userFarmSelector } from '../userFarmSlice';
import { withTranslation } from "react-i18next";

class Field extends Component {
  static defaultProps = {
    center: CENTER,
    zoom: DEFAULT_ZOOM,
    bounds: FARM_BOUNDS,
  };

  constructor(props) {
    super(props);
    this.state = {
      cropFilter: 'all',
      fieldFilter: 'all',
      startDate: moment([2009, 0, 1]),
      endDate: moment(),
      selectedTab: 1,
      map: null, //discuss usage
      isVisible: [],
      maps: null,
      isMapLoaded: false,
      area_unit: getUnit(this.props.farm, 'm2', 'ft2'),
      area_unit_label: getUnit(this.props.farm, 'm', 'ft'),
      showListSearchBar: true,
      center: CENTER,
      fields: this.props.fields,
      isPropReceived: false,
    };

    this.handleSelectTab = this.handleSelectTab.bind(this);
    this.handleGoogleMapApi = this.handleGoogleMapApi.bind(this);
    this.handleSearchTermChange = this.handleSearchTermChange.bind(this);

  }
  componentDidMount() {
    this.setState({center: this.props.farm.grid_points});
    const { dispatch } = this.props;
    dispatch(getFields());
    var visArray = [];
    if(this.props.fields){
      for(var i = 0; i < this.props.fields.length; i++){
        visArray.push(true);
      }
      this.setState({isVisible: visArray});
    }
  }

  componentWillReceiveProps(nextProps) {
      this.setState({
        fields: nextProps.fields,
        isPropReceived: true,
      });
  }

  handleSelectTab(selectedTab) {
    let showListSearchBar = selectedTab === 2;
    this.setState({ selectedTab, showListSearchBar });
  }

  handleGoogleMapApi(map, maps) {
    let farmBounds = new maps.LatLngBounds();
    let len = 0;
    let fieldIcon = {
      path: TREE_ICON,
      fillColor: styles.primaryColor,
      fillOpacity: 0,
      strokeWeight: 0,
      scale: 0.5,
    };

    maps.Polygon.prototype.getPolygonBounds = function () {
      var bounds = new maps.LatLngBounds();
      this.getPath().forEach(function (element, index) {
        bounds.extend(element);
      })
      return bounds;
    };


    let addListenersOnPolygonAndMarker = function (polygon, fieldObject) {
        // creates field marker
        var fieldMarker = new maps.Marker({
          position: polygon.getPolygonBounds().getCenter(),
          map: map,
          icon: fieldIcon,
          label: { text: fieldObject.field_name, color: 'white'}
        });

        // attach on click listeners
        //activeInfoWindow = null;

        function pushToHist(){
          history.push("./edit_field?"+fieldObject.field_id);
        }



        fieldMarker.setMap(map);

        maps.event.addListener(fieldMarker, 'click', function (event) {
          pushToHist();

        });
        maps.event.addListener(polygon, 'click', function (event) {
          pushToHist();
        });

    }

    if (this.state.fields && this.state.fields.length >= 1) {
      len = this.state.fields.length;
      let i;

      for (i = 0; i < len; i++) {
        // ensure that the map shows this field
        this.state.fields[i].grid_points.forEach((grid_point)=>{
          farmBounds.extend(grid_point);
        })
        // creates the polygon to be displayed on the map
        var polygon = new maps.Polygon({
          paths: this.state.fields[i].grid_points,
          strokeColor: styles.primaryColor,
          strokeOpacity: 0.8,
          strokeWeight: 3,
          fillColor: styles.primaryColor,
          fillOpacity: 0.35
        });
        polygon.setMap(map);
        addListenersOnPolygonAndMarker(polygon, this.state.fields[i]);
      }
      map.fitBounds(farmBounds);
    }
    this.setState({
      map,
      maps,
      isMapLoaded: true,
    });
  }

  handleSearchTermChange = (e) => {
    const searchTerm = e.target.value;
    var newVisStatus = [];
    for (var i = 0; i < this.state.fields.length; i++){
      var field = this.state.fields[i];
      if (String(field.field_name).toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())) {
        newVisStatus.push(true);
      }else{
        newVisStatus.push(false);
      }
    }
    this.setState({isVisible: newVisStatus});

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
      minZoom: 1,
      maxZoom: 80,
      tilt: 0,
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
  }

  render() {
    //UBC Farm Title
    const CenterDiv = ({ text }) => <div style={{ width: '30px', color: 'white', fontWeight: 'bold', fontSize: '16px', }}>{text}</div>;
    return (
      <div className={styles.logContainer}>
        <h3>
          <strong>{this.props.t('FIELDS.TITLE')}</strong>
        </h3>
        <hr />
        <h3><b>Action</b></h3>
        <div className={styles.buttonContainer}>
          <Button variant={'secondary'} onClick={() => {history.push('/new_field') }}>{this.props.t('FIELDS.ADD_NEW_FIELD')}</Button>
        </div>
        <hr />
        <h3><b>{this.props.t('FIELDS.EXPLORE')}</b></h3>
        <div>
          <Tabs
            activeKey={this.state.selectedTab}
            onSelect={this.handleSelectTab}
            id="controlled-tab-example"
          >
            <Tab eventKey={1} title="Map">
              {this.state.isPropReceived && <div style={{ width: "100%", height: "400px" }}>
                <GoogleMap
                  bootstrapURLKeys={{
                    key: GMAPS_API_KEY,
                    libraries: ['drawing', 'geometry', 'places']}}
                  defaultCenter={this.state.center}
                  defaultZoom={this.props.zoom}
                  yesIWantToUseGoogleMapApiInternals
                  onGoogleApiLoaded={({ map, maps }) => this.handleGoogleMapApi(map, maps)}
                  options={this.getMapOptions}
                >
                  <CenterDiv
                    lat={this.state.center.lat}
                    lng={this.state.center.lng}
                    text={"" && this.props.farm.farm_name}
                  />
                </GoogleMap>
              </div>}
            </Tab>
            <Tab eventKey={2} title="List">
              <Table>
                <thead>
                  <tr>
                    <th>{this.props.t('FIELDS.TABLE.FIELD_NAME')} <BsChevronDown /></th>
                    <th>{this.props.t('FIELDS.TABLE.AREA')} <BsChevronDown /></th>
                    <th>{this.props.t('FIELDS.TABLE.EDIT')}</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.fields && (this.state.fields.map((field,index) => {return this.state.isVisible[index] === false ? null : (
                    <tr key={field.field_id}>
                      <td>{field.field_name}</td>
                      <td>{roundToTwoDecimal(convertFromMetric(field.area, this.state.area_unit, 'm2'))} {this.state.area_unit_label}<sup>2</sup></td>
                      <td>
                        <a onClick={() => {history.push('./edit_field?' + field.field_id)}}>
                          <BsChevronRight  style={{color:'#349289'}} />
                        </a>
                      </td>
                    </tr>
                  );}

                  ))}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    fields: fieldSelector(state),
    fieldCrops: fieldCropSelector(state),
    farm: userFarmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Field));
