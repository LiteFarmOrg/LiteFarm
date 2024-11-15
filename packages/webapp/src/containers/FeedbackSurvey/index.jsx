/*
 *  Copyright 2024 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import TextButton from '../../components/Form/Button/TextButton';
import { ReactComponent as SendIcon } from '../../assets/images/send-icon.svg';
import styles from './styles.module.scss';
import Drawer from '../../components/Drawer';
import SideDrawer from '../../components/SideDrawer';

export default function FeedbackSurvey() {
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const toggleSurveyOpen = () => setIsSurveyOpen(!isSurveyOpen);
  const title = (
    <div className={styles.surveyTitleWrapper}>
      <SendIcon className={styles.surveyButtonTitleIcon} />
      Get help or give us feedback
    </div>
  );

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const drawerContent = <div className={styles.content}>this is some content</div>;

  return (
    <div>
      <TextButton className={styles.surveyButton} onClick={toggleSurveyOpen}>
        <SendIcon />
      </TextButton>
      {isDesktop && (
        <SideDrawer
          isOpen={isSurveyOpen}
          onClose={() => setIsSurveyOpen(false)}
          title={title}
          fullHeight={false}
        >
          {drawerContent}
        </SideDrawer>
      )}
      {!isDesktop && (
        <Drawer
          isOpen={isSurveyOpen}
          onClose={() => setIsSurveyOpen(false)}
          title={title}
          addBackdrop={false}
          responsiveModal={false}
          fullHeight={true}
        >
          {drawerContent}
        </Drawer>
      )}
    </div>
  );
}
