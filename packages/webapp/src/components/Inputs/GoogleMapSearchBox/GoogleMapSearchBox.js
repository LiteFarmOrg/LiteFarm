import React, { Component } from 'react';
import PropTypes from 'prop-types';

class SearchBox extends Component {
  static propTypes = {
    mapsapi: PropTypes.shape({
      places: PropTypes.shape({
        SearchBox: PropTypes.func,
      }),
      event: PropTypes.shape({
        clearInstanceListeners: PropTypes.func,
      }),
    }).isRequired,
    placeholder: PropTypes.string,
    onPlacesChanged: PropTypes.func,
  };

  static defaultProps = {
    placeholder: 'Search...',
    onPlacesChanged: null,
  };

  constructor(props) {
    super(props);
    this.searchBox = null;
  }

  componentDidMount() {
    // this.searchBox = new places.SearchBox(this.searchInput.current);
    // this.searchBox.addListener('places_changed', this.onPlacesChanged);

    // break
    const { map } = this.props;
    const maps = this.props.mapsapi;
    var input = document.getElementById('pac-input');
    this.searchBox = new maps.places.SearchBox(input);
    map.controls[maps.ControlPosition.TOP_CENTER].push(input);

    let that = this;
    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
      that.searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.

    this.searchBox.addListener('places_changed', function () {
      var places = that.searchBox.getPlaces();

      if (places.length === 0) {
        return;
      }

      // Clear out the old markers.
      markers.forEach(function (marker) {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      var bounds = new maps.LatLngBounds();
      places.forEach(function (place) {
        if (!place.geometry) {
          console.log('Returned place contains no geometry');
          return;
        }
        var icon = {
          url: place.icon,
          size: new maps.Size(71, 71),
          origin: new maps.Point(0, 0),
          anchor: new maps.Point(17, 34),
          scaledSize: new maps.Size(25, 25),
        };

        // Create a marker for each place.
        markers.push(
          new maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location,
          }),
        );

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  }

  componentWillUnmount() {
    const maps = this.props.mapsapi;
    maps.event.clearInstanceListeners(this.searchBox);
  }

  render() {
    const { placeholder } = this.props;

    return (
      <input
        id="pac-input"
        placeholder={placeholder}
        type="text"
        style={{
          width: '85%',
          height: '42px',
          fontSize: '16px',
          padding: '10px',
          margin: '6px auto 0 auto',
          borderRadius: '8px',
        }}
      />
    );
  }
}

export default SearchBox;
