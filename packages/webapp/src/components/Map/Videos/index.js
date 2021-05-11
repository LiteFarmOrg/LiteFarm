import React from 'react';
import Carousel from 'nuka-carousel';
import AreaVideo from '../../../assets/videos/AreaDrawing.mp4';
import LineVideo from '../../../assets/videos/LineDrawing.mp4';
import PointVideo from '../../../assets/videos/AddingPoints.mp4';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import './styles.module.scss';
import TitleLayout from "../../Layout/TitleLayout";

function PureVideoView({ history }) {
  return (
    <TitleLayout title={'Map Tutorials'} onGoBack={() => history.push('/map')}>
        <Carousel
          width={'100%'}
          initialSlideHeight={'first'}
          renderCenterLeftControls={({previousSlide}) => (
            <a onClick={previousSlide}>
              <BsChevronLeft style={{color: 'white'}} />
            </a>
            )
          }
          renderCenterRightControls={({nextSlide}) => (
            <a onClick={nextSlide}>
              <BsChevronRight style={{color: 'white'}} />
            </a>
          )}
        >
          <video controls style={{width: '100%', height: 'auto'}} loop  muted src={AreaVideo} />
          <video controls style={{width: '100%', height: 'auto'}} loop muted src={LineVideo} />
          <video controls style={{width: '100%', height: 'auto'}} loop  muted src={PointVideo} />
        </Carousel>
    </TitleLayout>
  )
}

export default PureVideoView;

