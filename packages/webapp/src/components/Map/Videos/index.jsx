import { useRef, useEffect } from 'react';
import AreaVideo from '../../../assets/videos/AreaDrawing.mp4';
import LineVideo from '../../../assets/videos/LineDrawing.mp4';
import PointVideo from '../../../assets/videos/AddingPoints.mp4';
import styles from './styles.module.scss';
import TitleLayout from '../../Layout/TitleLayout';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
const VIDEO_START_TIME = '#t=0.001';

function PureVideoView() {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const areaVideoRef = useRef(null);
  const lineVideoRef = useRef(null);
  const pointVideoRef = useRef(null);

  useEffect(() => {
    areaVideoRef.current.src += VIDEO_START_TIME;
    lineVideoRef.current.src += VIDEO_START_TIME;
    pointVideoRef.current.src += VIDEO_START_TIME;
  }, []);

  return (
    <TitleLayout title={t('FARM_MAP.TUTORIALS')} onGoBack={() => navigate('/map')}>
      <div className={styles.videoFlex}>
        <div style={{ flex: '1' }}>
          <video
            ref={areaVideoRef}
            controls
            style={{ width: '95%', height: 'auto' }}
            loop
            muted
            src={AreaVideo}
          />
        </div>
        <div className={styles.videoSpace} />
        <div style={{ flex: '1' }}>
          <video
            ref={lineVideoRef}
            controls
            style={{ width: '95%', height: 'auto' }}
            loop
            muted
            src={LineVideo}
          />
        </div>
        <div className={styles.videoSpace} />
        <div style={{ flex: '1' }}>
          <video
            ref={pointVideoRef}
            controls
            style={{ width: '95%', height: 'auto' }}
            loop
            muted
            src={PointVideo}
          />
        </div>
      </div>
    </TitleLayout>
  );
}

export default PureVideoView;
