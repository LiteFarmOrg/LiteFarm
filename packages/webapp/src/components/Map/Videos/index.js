import React from 'react';
import AreaVideo from '../../../assets/videos/AreaDrawing.mp4';
import LineVideo from '../../../assets/videos/LineDrawing.mp4';
import PointVideo from '../../../assets/videos/AddingPoints.mp4';
import styles from './styles.module.scss';
import TitleLayout from "../../Layout/TitleLayout";

function PureVideoView({ history }) {
  return (
    <TitleLayout title={'Map Tutorials'} onGoBack={() => history.push('/map')}>
      <div className={styles.videoFlex}>
        <div style={{flex : '1'}}>
          <video controls style={{width: '95%', height: 'auto'}} loop  muted src={AreaVideo} />
        </div>
        <div className={styles.videoSpace} />
        <div style={{flex : '1'}}>
          <video controls style={{width: '95%', height: 'auto'}} loop muted src={LineVideo} />
        </div>
        <div className={styles.videoSpace} />

        <div style={{flex : '1'}}>
          <video controls style={{width: '95%', height: 'auto'}} loop  muted src={PointVideo} />
        </div>
      </div>
    </TitleLayout>
  )
}

export default PureVideoView;

