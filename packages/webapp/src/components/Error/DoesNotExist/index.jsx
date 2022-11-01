import React from 'react';
import PropTypes from 'prop-types';
import PageTitle from '../../PageTitle/v2';

/**
 * @function DoesNotExist
 * @callback onGoBack
 * @param {object} props Component props
 * @param {string} props.message - String that describes issue
 * @param {onGoBack} props.onGoBack - Callback function for 'Go Back' arrow
 * @returns {object} DoesNotExist
 * @description Error Display For Does Not Exist
 * @todo Make pretty
 */
export default function DoesNotExist({message, onGoBack}) {
    return (
    <>
      <PageTitle
          title={'Go Back'}
          style={{ paddingBottom: '20px' }}
          onGoBack={onGoBack}
      />
      <h2>{message}</h2>
    </>
    );    
} 

DoesNotExist.propTypes = {
  message: PropTypes.string,
  onGoBack: PropTypes.func,
};