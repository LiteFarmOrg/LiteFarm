import React from 'react';
import PropTypes from 'prop-types';
import PageTitle from '../../PageTitle/v2';

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