import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { downloadExport } from './saga';

export default function DownloadExport({ match }) {
  const { id, from, to } = match.params;
  let fileSrc = atob(id);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(downloadExport({
      file: `https://${process.env.REACT_APP_DO_BUCKET_NAME}.nyc3.digitaloceanspaces.com/${fileSrc}.zip`,
      from,
      to
  }));
  }, [])

  return <>Loading...</>;
}
