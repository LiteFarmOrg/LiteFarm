import JSZip from 'jszip';
import { fetchFile } from './utils';
import { useState } from 'react';
import { ImageWithAuthentication } from './index';
import Square from '../../components/Square';
import { LinearProgress } from '@material-ui/core';

export function DownloadDocument() {
  const files = [
    'https://images.litefarm.workers.dev/8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124/document/a1fae373-06e1-4e94-bc6c-75c5a45d10d3.pdf',
    'https://images.litefarm.workers.dev/8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124/document/540fcf7e-ef1b-417f-8c9a-a390389857dc.png',
    'https://images.litefarm.workers.dev/3adf420a-bd99-11eb-9626-0367399c26fc/document/39f19787-310d-495b-8370-3f451b65e255.jpg',
    'https://images.litefarm.workers.dev/8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124/document/c6a7206b-8cfc-471e-86f3-3e9ab87cc71b.png',
    'https://images.litefarm.workers.dev/8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124/document/6e8b3a23-3979-451d-8ce3-251588e72ba7.png',
    'https://images.litefarm.workers.dev/8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124/document/abcec49e-bac4-47af-bd4d-7458dd67a892.png',
    'https://images.litefarm.workers.dev/8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124/document/ce6de824-3b0d-48e5-ba8c-3992c42107dd.png',
  ];
  const [progress, setProgress] = useState(0);
  const onDownloadFinish = () => {
    setProgress((prevProgress) => prevProgress + 1);
  };
  const onClick = async () => {
    const zip = new JSZip();
    await Promise.all(
      files.map(async (url) => {
        const response = await fetchFile(url);
        const image = await response.blob();
        zip.file(new URL(url).pathname.split('/')[3], image);
        onDownloadFinish();
      }),
    );
    await zip.generateAsync({ type: 'blob' }).then((zipBlob) => {
      const link = document.createElement('a');
      link.download = `name.zip`;
      link.href = URL.createObjectURL(zipBlob);
      link.click();
      onDownloadFinish();
    });
  };

  return (
    <>
      <button onClick={onClick}>Download</button>
      <ImageWithAuthentication src={files[2]} />
      <Square style={{ marginBottom: '24px' }}>{(progress / (files.length + 1)) * 100}</Square>
      <LinearProgress variant="determinate" value={(progress / (files.length + 1)) * 100} />
    </>
  );
}
