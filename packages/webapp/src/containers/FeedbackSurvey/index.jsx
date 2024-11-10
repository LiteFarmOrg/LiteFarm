import { useState } from 'react';
import TextButton from '../../components/Form/Button/TextButton';
import { FiSend } from 'react-icons/fi';
import Drawer from '../../components/Drawer';
import styles from './styles.module.scss';
import ModalComponent from '../../components/Modals/ModalComponent/v2';
import { ContainerWithIcon } from '../../components/ContainerWithIcon/ContainerWithIcon';
import SideDrawer from '../../components/SideDrawer';

export default function FeedbackSurvey() {
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const toggleSurveyOpen = () => setIsSurveyOpen(!isSurveyOpen);
  const title = (
    <div className={styles.surveyTitleWrapper}>
      <FiSend className={styles.surveyButtonTitleIcon} />
      Get help or give us feedback
    </div>
  );

  return (
    <div>
      <TextButton className={styles.surveyButton} onClick={toggleSurveyOpen}>
        <FiSend className={styles.surveyButtonIcon} />
      </TextButton>
      {isSurveyOpen && (
        <SideDrawer
          isOpen={isSurveyOpen}
          onClose={() => setIsSurveyOpen(false)}
          title={title}
          addBackdrop={false}
          responsiveModal={false}
          fullHeight={true}
        >
          <div className={styles.content}>this is some content</div>
        </SideDrawer>
      )}
    </div>
  );
}
