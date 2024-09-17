import { useState } from 'react';
import TextButton from '../../components/Form/Button/TextButton';
import { FiSend } from 'react-icons/fi';
import Drawer from '../../components/Drawer';
import styles from './styles.module.scss';
import { ContainerWithIcon } from '../../components/ContainerWithIcon/ContainerWithIcon';

export default function FeedbackSurvey() {
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const toggleSurveyOpen = () => setIsSurveyOpen(!isSurveyOpen);

  return (
    <div>
      <TextButton className={styles.surveyButton} onClick={toggleSurveyOpen}>
        <FiSend className={styles.surveyButtonIcon} />
      </TextButton>
    </div>
  );
}
