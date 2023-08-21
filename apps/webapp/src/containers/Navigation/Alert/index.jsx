import React, { useEffect } from 'react';
import PureAlert from '../../../components/Navigation/NavBar/Alert';
import { useDispatch, useSelector } from 'react-redux';
import { alertSelector } from './alertSlice';
import { getAlert } from './saga';

export default function Alert() {
  const { error, loaded, count } = useSelector(alertSelector);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAlert());
  }, []);

  return loaded && !error && count ? <PureAlert {...{ alertCount: count }} /> : <span />;
}

Alert.propTypes = {};
