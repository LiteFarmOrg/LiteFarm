import { useEffect } from 'react';
import { getUserFarms } from '../ChooseFarm/saga';
import { useDispatch, useSelector } from 'react-redux';
import { userFarmSelector } from '../userFarmSlice';

export default function DownloadExport({ match }) {
  const exportSource = match.params.id;
  let fileSrc = atob(exportSource);
  const dispatch = useDispatch();
  const farm = useSelector(userFarmSelector);
  fileSrc = `https://${process.env.REACT_APP_DO_BUCKET_NAME}.nyc3.digitaloceanspaces.com/${fileSrc}.zip`;

  useEffect(() => {
    dispatch(getUserFarms());
  }, [])

  useEffect(() => {
    const fileName = farm?.farm_name ? `${farm.farm_name}.zip` : undefined;
    const config = {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('farm_token'),
      },
      responseType: 'arraybuffer',
      method: 'GET',
    };
    const url = new URL(fileSrc);
    url.hostname = 'images.litefarm.workers.dev';
    getResponse(url, config);

    async function getResponse(url, config) {
      const response = await fetch(url, config);
      const newBlob = await response.blob();
      downloadBlob(newBlob, fileName);
    }
  }, [farm]);

  return <>Loading...</>;
}

function downloadBlob(blob, name = 'export.zip') {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = name;
  document.body.appendChild(link);
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );
  document.body.removeChild(link);
}
