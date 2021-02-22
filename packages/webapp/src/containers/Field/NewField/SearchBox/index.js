import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { FormControl, InputGroup } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';

class SearchBox extends Component {
  render() {
    return (
      <div>
        <InputGroup className={styles.searchBarContainer}>
          <InputGroup.Prepend>
            <InputGroup.Text>
              {this.props.t('FIELDS.NEW_FIELD.SEARCH_BOX_PLACEHOLDER')}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl type="text" placeholder={this.props.placeholder} />
        </InputGroup>
      </div>
    );
  }
  onPlacesChanged = () => {
    if (this.props.onPlacesChanged) {
      this.props.onPlacesChanged(this.searchBox.getPlaces());
    }
  };

  // componentWillUnmount() {
  //   google.maps.event.clearInstanceListeners(this.searchBox);
  // }
}

SearchBox.propTypes = {
  placeholder: PropTypes.string,
  onPlacesChanged: PropTypes.func,
};

export default withTranslation()(SearchBox);
