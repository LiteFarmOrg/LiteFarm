import { useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import { useDispatch } from 'react-redux';
import { handle403 } from '../saga';

export default function Forbidden({ history }) {
 const dispatch = useDispatch();
 useEffect(() => {
  if (history?.location?.state?.error?.response?.status === 403) {
   dispatch(handle403());
  } else if (history.length) {
   history.back();
  } else {
   history.replace('/');
  }
 }, []);
 return <Spinner />;
}
