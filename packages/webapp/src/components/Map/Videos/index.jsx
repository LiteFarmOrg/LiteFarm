import React from 'react';
import styles from './styles.module.scss';
import TitleLayout from '../../Layout/TitleLayout';

function PureVideoView({ history }) {
  return (
    <TitleLayout title={'Map Tutorials'} onGoBack={() => history.push('/map')}>
      <div className={styles.videoFlex}>
        <div style={{ flex: '1' }}>
          <video
            controls
            style={{ width: '95%', height: 'auto' }}
            loop
            muted
            src={'../../../src/assets/videos/AreaDrawing.mp4#t=0.001'}
          />
        </div>
        <div className={styles.videoSpace} />
        <div style={{ flex: '1' }}>
          <video
            controls
            style={{ width: '95%', height: 'auto' }}
            loop
            muted
            src={'../../../src/assets/videos/LineDrawing.mp4#t=0.001'}
          />
        </div>
        <div className={styles.videoSpace} />
        <div style={{ flex: '1' }}>
          <video
            controls
            style={{ width: '95%', height: 'auto' }}
            loop
            muted
            src={'../../../src/assets/videos/AddingPoints.mp4#t=0.001'}
          />
        </div>
      </div>
    </TitleLayout>
  );
}

export default PureVideoView;
