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

import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepConnector from '@mui/material/StepConnector';
import type { StepIconProps } from '@mui/material/StepIcon';
import styles from './styles.module.scss';
import { ReactComponent as DoneLight } from '../../assets/images/stepper/done-light.svg';
import { ReactComponent as ActiveLight } from '../../assets/images/stepper/active-light.svg';
import { ReactComponent as DefaultLight } from '../../assets/images/stepper/disabled-light.svg';
import { ReactComponent as DoneDark } from '../../assets/images/stepper/done-dark.svg';
import { ReactComponent as ActiveDark } from '../../assets/images/stepper/active-dark.svg';
import { ReactComponent as DefaultDark } from '../../assets/images/stepper/disabled-dark.svg';

export type StepperProgressBarProps = {
  steps: string[];
  activeStep: number;
  isMobile?: boolean;
  isDarkMode?: boolean;
};

const StepperProgressBar = ({
  steps,
  activeStep,
  isMobile,
  isDarkMode,
}: StepperProgressBarProps) => {
  return (
    <div className={isDarkMode ? styles.darkMode : styles.lightMode}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel={isMobile}
        connector={<CustomLine />}
        classes={{
          root: styles.root,
          alternativeLabel: styles.mobile,
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              classes={{
                root: styles.label,
                disabled: styles.label,
                completed: styles.label,
                active: styles.activeLabel,
                alternativeLabel: styles.mobileLabel,
              }}
              StepIconComponent={isDarkMode ? CustomDarkIcons : CustomLightIcons}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

const CustomLine = () => {
  return (
    <StepConnector
      classes={{
        root: styles.connector,
        line: styles.line,
        active: styles.activeLine,
        completed: styles.completedLine,
      }}
    />
  );
};

const CustomLightIcons = ({ active, completed }: StepIconProps) => {
  return (
    <div className={styles.icon}>
      {completed ? <DoneLight /> : active ? <ActiveLight /> : <DefaultLight />}
    </div>
  );
};

const CustomDarkIcons = ({ active, completed }: StepIconProps) => {
  return (
    <div className={styles.icon}>
      {completed ? <DoneDark /> : active ? <ActiveDark /> : <DefaultDark />}
    </div>
  );
};

export default StepperProgressBar;
